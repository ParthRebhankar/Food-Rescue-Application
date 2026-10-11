import { supabase, isSupabaseConfigured } from './supabase';

export const reservationService = {
  /**
   * Create a reservation using atomic RPC create_reservation
   */
  async createReservation(bundleId, quantity = 1) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.rpc('create_reservation', {
      p_bundle_id: bundleId,
      p_quantity: parseInt(quantity, 10),
    });

    if (error) {
      console.error('RPC create_reservation error:', error);
      // Fallback if RPC function wasn't executed in SQL yet
      if (error.message && error.message.includes('function') && error.message.includes('not found')) {
        return await this._createReservationFallback(bundleId, quantity);
      }
      throw new Error(error.message || 'Failed to complete reservation');
    }

    return data;
  },

  /**
   * Fallback reservation handler if RPC function has not yet been executed in Supabase SQL editor
   */
  async _createReservationFallback(bundleId, quantity) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('You must be logged in to reserve');

    // Fetch bundle
    const { data: bundle, error: bError } = await supabase
      .from('food_bundles')
      .select('*')
      .eq('id', bundleId)
      .single();

    if (bError || !bundle) throw new Error('Bundle not found');
    if (bundle.available_quantity < quantity) {
      throw new Error(`Only ${bundle.available_quantity} items remaining`);
    }

    const code = 'PK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const totalPrice = Number((bundle.discounted_price * quantity).toFixed(2));

    // Update inventory
    const { error: updError } = await supabase
      .from('food_bundles')
      .update({ available_quantity: bundle.available_quantity - quantity })
      .eq('id', bundleId);

    if (updError) throw updError;

    // Insert reservation
    const { data: resData, error: insError } = await supabase
      .from('reservations')
      .insert([{
        bundle_id: bundleId,
        customer_id: user.id,
        quantity: quantity,
        total_price: totalPrice,
        status: 'reserved',
        pickup_code: code,
      }])
      .select()
      .single();

    if (insError) throw insError;
    return {
      success: true,
      reservation_id: resData.id,
      pickup_code: code,
      quantity,
      total_price: totalPrice,
    };
  },

  /**
   * Cancel an active reservation (restores stock)
   */
  async cancelReservation(reservationId) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.rpc('cancel_reservation', {
      p_reservation_id: reservationId,
    });

    if (error) {
      if (error.message && error.message.includes('function') && error.message.includes('not found')) {
        // Direct fallback
        const { data: res } = await supabase.from('reservations').select('*, bundle:food_bundles(*)').eq('id', reservationId).single();
        if (res && res.status === 'reserved') {
          await supabase.from('food_bundles').update({
            available_quantity: res.bundle.available_quantity + res.quantity
          }).eq('id', res.bundle_id);

          await supabase.from('reservations').update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          }).eq('id', reservationId);

          return { success: true };
        }
      }
      throw new Error(error.message || 'Failed to cancel reservation');
    }

    return data;
  },

  /**
   * Merchant confirms pickup (status becomes picked_up)
   */
  async confirmPickup(reservationId) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.rpc('confirm_pickup', {
      p_reservation_id: reservationId,
    });

    if (error) {
      if (error.message && error.message.includes('function') && error.message.includes('not found')) {
        // Direct fallback
        await supabase
          .from('reservations')
          .update({
            status: 'picked_up',
            picked_up_at: new Date().toISOString(),
          })
          .eq('id', reservationId);

        return { success: true, status: 'picked_up' };
      }
      throw new Error(error.message || 'Failed to confirm pickup');
    }

    return data;
  },

  /**
   * Fetch customer's own reservations with bundle & restaurant details
   */
  async getCustomerReservations(customerId) {
    if (!isSupabaseConfigured || !customerId) return [];

    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        bundle:food_bundles (
          id,
          title,
          category,
          weight_kg,
          image_url,
          pickup_deadline,
          discounted_price,
          restaurant:restaurants (
            id,
            name,
            address,
            phone,
            latitude,
            longitude
          )
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching customer reservations:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Fetch merchant's incoming reservations
   */
  async getMerchantReservations(merchantId) {
    if (!isSupabaseConfigured || !merchantId) return [];

    // Query reservations for bundles belonging to this merchant
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        customer:profiles!reservations_customer_id_fkey (
          id,
          full_name,
          email,
          phone
        ),
        bundle:food_bundles!inner (
          id,
          title,
          weight_kg,
          merchant_id,
          restaurant:restaurants (
            id,
            name
          )
        )
      `)
      .eq('bundle.merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching merchant reservations:', error);
      throw error;
    }
    return data || [];
  },
};
