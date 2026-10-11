import { supabase, isSupabaseConfigured } from './supabase';

export const DEMO_NAGPUR_STORES = [
  {
    name: 'Green Crust Artisan Bakery (Demo)',
    description: 'Neighborhood sourdough bakery offering day-end sourdough boules, croissants, and artisan baguettes.',
    address: 'West High Court Road, Dharampeth, Nagpur, Maharashtra 440010',
    category: 'Bakery',
    latitude: 21.1426,
    longitude: 79.0620,
    phone: '+91 98230 11223',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Heritage Farm Direct Produce (Demo)',
    description: 'Organic local farmers collective providing surplus pesticide-free seasonal vegetables and fresh greens.',
    address: 'VIP Road, Civil Lines, Nagpur, Maharashtra 440001',
    category: 'Grocery',
    latitude: 21.1550,
    longitude: 79.0768,
    phone: '+91 98230 44556',
    image_url: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bhojnam Gourmet Kitchen (Demo)',
    description: 'Sustainable contemporary diner packaging freshly prepped dinner entrees and rice bowls.',
    address: 'Residency Road, Sadar, Nagpur, Maharashtra 440001',
    category: 'Restaurant',
    latitude: 21.1610,
    longitude: 79.0850,
    phone: '+91 98230 77889',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Naturals Organic Deli & Pantry (Demo)',
    description: 'Specialty gourmet grocer offering surplus cold-pressed juices, dairy yogurts, and sandwich packs.',
    address: 'Central Bazaar Road, Ramdaspeth, Nagpur, Maharashtra 440010',
    category: 'Other',
    latitude: 21.1350,
    longitude: 79.0740,
    phone: '+91 98230 99001',
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
  },
];

export const restaurantService = {
  /**
   * Fetch all registered stores
   */
  async getAllRestaurants() {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
    return data || [];
  },

  /**
   * Fetch stores belonging to a specific merchant
   */
  async getMerchantRestaurants(merchantId) {
    if (!isSupabaseConfigured || !merchantId) return [];

    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new store
   */
  async createRestaurant(merchantId, restaurantData) {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase
      .from('restaurants')
      .insert([{
        ...restaurantData,
        merchant_id: merchantId,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Seed demo stores & sample bundles for the logged-in merchant
   */
  async seedDemoStoresForMerchant(merchantId) {
    if (!isSupabaseConfigured || !merchantId) throw new Error('Supabase or merchant is unavailable.');

    const createdStores = [];

    for (const store of DEMO_NAGPUR_STORES) {
      const { data: storeData, error: storeError } = await supabase
        .from('restaurants')
        .insert([{
          ...store,
          merchant_id: merchantId,
        }])
        .select()
        .single();

      if (storeError) {
        console.error('Error seeding store:', storeError);
        continue;
      }

      createdStores.push(storeData);

      // Now create sample bundle for this store
      let bundlePayload = null;
      const now = new Date();
      const inTwelveHours = new Date(now.getTime() + 12 * 3600 * 1000).toISOString();

      if (store.category === 'Bakery') {
        bundlePayload = {
          restaurant_id: storeData.id,
          merchant_id: merchantId,
          title: 'Artisan Sourdough & Croissant Bag (Demo)',
          description: '1 whole wheat sourdough loaf and 3 flaky croissants baked fresh this morning.',
          category: 'Bakery',
          original_price: 450,
          discounted_price: 180,
          available_quantity: 6,
          weight_kg: 1.2,
          pickup_deadline: inTwelveHours,
          image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
          is_active: true,
        };
      } else if (store.category === 'Grocery') {
        bundlePayload = {
          restaurant_id: storeData.id,
          merchant_id: merchantId,
          title: 'Farm Harvest Produce Crate (Demo)',
          description: 'Fresh seasonal surplus bell peppers, leafy spinach, vine tomatoes, and carrots.',
          category: 'Grocery',
          original_price: 350,
          discounted_price: 140,
          available_quantity: 8,
          weight_kg: 3.0,
          pickup_deadline: inTwelveHours,
          image_url: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=800&q=80',
          is_active: true,
        };
      } else if (store.category === 'Restaurant') {
        bundlePayload = {
          restaurant_id: storeData.id,
          merchant_id: merchantId,
          title: 'Evening Gourmet Dinner Bento Box (Demo)',
          description: 'Wholesome hot packaged chef special dinner entree with basmati pilaf and side salad.',
          category: 'Restaurant',
          original_price: 499,
          discounted_price: 199,
          available_quantity: 5,
          weight_kg: 1.4,
          pickup_deadline: inTwelveHours,
          image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          is_active: true,
        };
      } else {
        bundlePayload = {
          restaurant_id: storeData.id,
          merchant_id: merchantId,
          title: 'Deli Healthy Snack & Juice Box (Demo)',
          description: 'Cold pressed seasonal fruit juices and artisan Greek yogurt granola cups.',
          category: 'Other',
          original_price: 380,
          discounted_price: 160,
          available_quantity: 7,
          weight_kg: 1.3,
          pickup_deadline: inTwelveHours,
          image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
          is_active: true,
        };
      }

      if (bundlePayload) {
        await supabase.from('food_bundles').insert([bundlePayload]);
      }
    }

    return createdStores;
  }
};
