import { supabase, isSupabaseConfigured } from './supabase';

export const bundleService = {
  /**
   * Fetch active, available, non-expired bundles for customers with optional search & category filter
   */
  async getMarketplaceBundles({ category = 'All', search = '' } = {}) {
    if (!isSupabaseConfigured) return [];

    const now = new Date().toISOString();

    let query = supabase
      .from('food_bundles')
      .select(`
        *,
        restaurant:restaurants (
          id,
          name,
          address,
          category,
          latitude,
          longitude,
          phone,
          image_url
        )
      `)
      .eq('is_active', true)
      .gt('available_quantity', 0)
      .gt('pickup_deadline', now)
      .order('pickup_deadline', { ascending: true });

    if (category && category !== 'All') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching marketplace bundles:', error);
      throw error;
    }

    let results = data || [];

    // Filter by search query (bundle title, description, or restaurant name)
    if (search && search.trim() !== '') {
      const term = search.toLowerCase().trim();
      results = results.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.restaurant?.name && item.restaurant.name.toLowerCase().includes(term)) ||
        (item.restaurant?.address && item.restaurant.address.toLowerCase().includes(term))
      );
    }

    return results;
  },

  /**
   * Fetch a single bundle by ID with restaurant and merchant details
   */
  async getBundleById(id) {
    if (!isSupabaseConfigured || !id) return null;

    const { data, error } = await supabase
      .from('food_bundles')
      .select(`
        *,
        restaurant:restaurants (
          id,
          name,
          address,
          description,
          category,
          latitude,
          longitude,
          phone,
          image_url
        ),
        merchant:profiles!food_bundles_merchant_id_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching bundle by ID:', error);
      throw error;
    }
    return data;
  },

  /**
   * Fetch all bundles created by a specific merchant
   */
  async getMerchantBundles(merchantId) {
    if (!isSupabaseConfigured || !merchantId) return [];

    const { data, error } = await supabase
      .from('food_bundles')
      .select(`
        *,
        restaurant:restaurants (
          id,
          name,
          address,
          category
        )
      `)
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching merchant bundles:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Create a new food bundle listing
   */
  async createBundle(bundleData) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    // Ensure valid numerical & deadline values
    const payload = {
      ...bundleData,
      original_price: Number(bundleData.original_price),
      discounted_price: Number(bundleData.discounted_price),
      available_quantity: parseInt(bundleData.available_quantity, 10),
      weight_kg: Number(bundleData.weight_kg),
    };

    const { data, error } = await supabase
      .from('food_bundles')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing bundle listing
   */
  async updateBundle(bundleId, bundleData) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const payload = {
      ...bundleData,
      original_price: Number(bundleData.original_price),
      discounted_price: Number(bundleData.discounted_price),
      available_quantity: parseInt(bundleData.available_quantity, 10),
      weight_kg: Number(bundleData.weight_kg),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('food_bundles')
      .update(payload)
      .eq('id', bundleId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete or archive a bundle listing
   */
  async deleteBundle(bundleId) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { error } = await supabase
      .from('food_bundles')
      .delete()
      .eq('id', bundleId);

    if (error) throw error;
    return true;
  },
};
