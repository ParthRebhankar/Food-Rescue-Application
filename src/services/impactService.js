import { supabase, isSupabaseConfigured } from './supabase';
import { calculateImpactMetrics } from '../utils/impactCalculator';

export const impactService = {
  /**
   * Calculate global platform environmental impact across all picked-up orders
   */
  async getGlobalImpact() {
    if (!isSupabaseConfigured) {
      return {
        metrics: calculateImpactMetrics(0),
        totalBundlesCollected: 0,
        recentRescues: [],
      };
    }

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          quantity,
          status,
          picked_up_at,
          bundle:food_bundles (
            id,
            title,
            category,
            weight_kg,
            restaurant:restaurants (
              name
            )
          )
        `)
        .eq('status', 'picked_up')
        .order('picked_up_at', { ascending: false });

      if (error) throw error;

      const rescues = data || [];
      let totalWeightKg = 0;
      let totalBundles = 0;

      for (const item of rescues) {
        const itemWeight = (item.bundle?.weight_kg || 1) * (item.quantity || 1);
        totalWeightKg += itemWeight;
        totalBundles += item.quantity || 1;
      }

      const metrics = calculateImpactMetrics(totalWeightKg);

      return {
        metrics,
        totalBundlesCollected: totalBundles,
        totalOrders: rescues.length,
        recentRescues: rescues.slice(0, 10),
      };
    } catch (err) {
      console.error('Error fetching global impact:', err);
      return {
        metrics: calculateImpactMetrics(0),
        totalBundlesCollected: 0,
        totalOrders: 0,
        recentRescues: [],
      };
    }
  },

  /**
   * Calculate impact for a specific customer
   */
  async getCustomerImpact(customerId) {
    if (!isSupabaseConfigured || !customerId) {
      return {
        metrics: calculateImpactMetrics(0),
        totalBundlesCollected: 0,
        history: [],
      };
    }

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          quantity,
          status,
          picked_up_at,
          created_at,
          bundle:food_bundles (
            id,
            title,
            category,
            weight_kg,
            restaurant:restaurants (
              name,
              address
            )
          )
        `)
        .eq('customer_id', customerId)
        .eq('status', 'picked_up')
        .order('picked_up_at', { ascending: false });

      if (error) throw error;

      const rescues = data || [];
      let totalWeightKg = 0;
      let totalBundles = 0;

      for (const item of rescues) {
        const itemWeight = (item.bundle?.weight_kg || 1) * (item.quantity || 1);
        totalWeightKg += itemWeight;
        totalBundles += item.quantity || 1;
      }

      const metrics = calculateImpactMetrics(totalWeightKg);

      return {
        metrics,
        totalBundlesCollected: totalBundles,
        history: rescues,
      };
    } catch (err) {
      console.error('Error fetching customer impact:', err);
      return {
        metrics: calculateImpactMetrics(0),
        totalBundlesCollected: 0,
        history: [],
      };
    }
  },

  /**
   * Calculate impact rescued by a specific merchant
   */
  async getMerchantImpact(merchantId) {
    if (!isSupabaseConfigured || !merchantId) {
      return {
        metrics: calculateImpactMetrics(0),
        totalBundlesCollected: 0,
        history: [],
      };
    }

    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          quantity,
          status,
          picked_up_at,
          created_at,
          bundle:food_bundles!inner (
            id,
            title,
            category,
            weight_kg,
            merchant_id
          )
        `)
        .eq('bundle.merchant_id', merchantId)
        .eq('status', 'picked_up')
        .order('picked_up_at', { ascending: false });

      if (error) throw error;

      const rescues = data || [];
      let totalWeightKg = 0;
      let totalBundles = 0;

      for (const item of rescues) {
        const itemWeight = (item.bundle?.weight_kg || 1) * (item.quantity || 1);
        totalWeightKg += itemWeight;
        totalBundles += item.quantity || 1;
      }

      const metrics = calculateImpactMetrics(totalWeightKg);

      return {
        metrics,
        totalBundlesCollected: totalBundles,
        history: rescues,
      };
    } catch (err) {
      console.error('Error fetching merchant impact:', err);
      return {
        metrics: calculateImpactMetrics(0),
        totalBundlesCollected: 0,
        history: [],
      };
    }
  },
};
