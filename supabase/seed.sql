-- ====================================================================
-- HARVESTHERO | SUPABASE SEED DATA (NAGPUR DEMO STORES & SURPLUS BUNDLES)
-- ====================================================================

DO $$
DECLARE
  v_specified_merchant_uuid UUID := NULL; 
  v_merchant_id UUID;
  v_rest1_id UUID;
  v_rest2_id UUID;
  v_rest3_id UUID;
  v_rest4_id UUID;
  v_rest5_id UUID;
BEGIN
  -- ------------------------------------------------------------------
  -- 1. RESOLVE VALID MERCHANT ACCOUNT
  -- ------------------------------------------------------------------
  IF v_specified_merchant_uuid IS NOT NULL THEN
    SELECT id INTO v_merchant_id 
    FROM public.profiles 
    WHERE id = v_specified_merchant_uuid;

    IF v_merchant_id IS NULL THEN
      RAISE EXCEPTION 'Specified merchant UUID % does not exist in public.profiles table.', v_specified_merchant_uuid;
    END IF;
  ELSE
    -- Automatically detect the most recently registered merchant profile
    SELECT id INTO v_merchant_id 
    FROM public.profiles 
    WHERE role = 'merchant' 
    ORDER BY created_at DESC 
    LIMIT 1;

    -- If no merchant profile exists, check if any profile exists and promote it
    IF v_merchant_id IS NULL THEN
      SELECT id INTO v_merchant_id 
      FROM public.profiles 
      ORDER BY created_at DESC 
      LIMIT 1;
      
      IF v_merchant_id IS NOT NULL THEN
        UPDATE public.profiles SET role = 'merchant' WHERE id = v_merchant_id;
        RAISE NOTICE 'Promoted profile % to merchant role for demo seeding.', v_merchant_id;
      END IF;
    END IF;
  END IF;

  -- Prerequisite guard
  IF v_merchant_id IS NULL THEN
    RAISE EXCEPTION 'No user account found in public.profiles. Please sign up in the app at /signup first.';
  END IF;

  RAISE NOTICE 'Seeding demo data linked to merchant profile UUID: %', v_merchant_id;

  -- ------------------------------------------------------------------
  -- 2. SEED DEMO STORES IN NAGPUR (IDEMPOTENT)
  -- ------------------------------------------------------------------

  -- Store 1: Nagpur Fresh Bakery (Dharampeth)
  SELECT id INTO v_rest1_id FROM public.restaurants WHERE name = 'Nagpur Fresh Bakery (Demo)' AND merchant_id = v_merchant_id;
  IF v_rest1_id IS NULL THEN
    INSERT INTO public.restaurants (merchant_id, name, description, address, category, latitude, longitude, phone, image_url, is_verified)
    VALUES (
      v_merchant_id,
      'Nagpur Fresh Bakery (Demo)',
      'Artisanal neighborhood sourdough & pastry bakery packing freshly baked morning and day-end surplus goods.',
      'West High Court Road, Dharampeth, Nagpur, Maharashtra 440010',
      'Bakery',
      21.1426,
      79.0620,
      '+91 98230 11223',
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      true
    ) RETURNING id INTO v_rest1_id;
  END IF;

  -- Store 2: Orange City Bites (Sitabuldi)
  SELECT id INTO v_rest2_id FROM public.restaurants WHERE name = 'Orange City Bites (Demo)' AND merchant_id = v_merchant_id;
  IF v_rest2_id IS NULL THEN
    INSERT INTO public.restaurants (merchant_id, name, description, address, category, latitude, longitude, phone, image_url, is_verified)
    VALUES (
      v_merchant_id,
      'Orange City Bites (Demo)',
      'Famous Nagpur diner preparing fresh, wholesome evening meals and regional delicacies with zero waste commitments.',
      'Variety Square, Sitabuldi, Nagpur, Maharashtra 440012',
      'Restaurant',
      21.1458,
      79.0882,
      '+91 98230 22334',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      true
    ) RETURNING id INTO v_rest2_id;
  END IF;

  -- Store 3: Daily Harvest Cafe (Sadar)
  SELECT id INTO v_rest3_id FROM public.restaurants WHERE name = 'Daily Harvest Cafe (Demo)' AND merchant_id = v_merchant_id;
  IF v_rest3_id IS NULL THEN
    INSERT INTO public.restaurants (merchant_id, name, description, address, category, latitude, longitude, phone, image_url, is_verified)
    VALUES (
      v_merchant_id,
      'Daily Harvest Cafe (Demo)',
      'Contemporary eco-friendly bistro serving artisan salads, sandwiches, cold press juices, and grain bowls.',
      'Residency Road, Sadar, Nagpur, Maharashtra 440001',
      'Restaurant',
      21.1610,
      79.0850,
      '+91 98230 33445',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      true
    ) RETURNING id INTO v_rest3_id;
  END IF;

  -- Store 4: Green Basket Foods (Manish Nagar)
  SELECT id INTO v_rest4_id FROM public.restaurants WHERE name = 'Green Basket Foods (Demo)' AND merchant_id = v_merchant_id;
  IF v_rest4_id IS NULL THEN
    INSERT INTO public.restaurants (merchant_id, name, description, address, category, latitude, longitude, phone, image_url, is_verified)
    VALUES (
      v_merchant_id,
      'Green Basket Foods (Demo)',
      'Local farmer direct collective packaging crisp farm surplus vegetables, greens, and seasonal Nagpur citrus.',
      'Somalwada-Manish Nagar Road, Nagpur, Maharashtra 440015',
      'Grocery',
      21.0980,
      79.0720,
      '+91 98230 44556',
      'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
      true
    ) RETURNING id INTO v_rest4_id;
  END IF;

  -- Store 5: Midnight Munchies Deli (Civil Lines)
  SELECT id INTO v_rest5_id FROM public.restaurants WHERE name = 'Midnight Munchies Deli (Demo)' AND merchant_id = v_merchant_id;
  IF v_rest5_id IS NULL THEN
    INSERT INTO public.restaurants (merchant_id, name, description, address, category, latitude, longitude, phone, image_url, is_verified)
    VALUES (
      v_merchant_id,
      'Midnight Munchies Deli (Demo)',
      'Gourmet deli store offering shelf-nearing packaged yogurt parfaits, cheese boards, and artisan snack trays.',
      'VIP Road, Civil Lines, Nagpur, Maharashtra 440001',
      'Other',
      21.1550,
      79.0768,
      '+91 98230 55667',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
      true
    ) RETURNING id INTO v_rest5_id;
  END IF;

  -- ------------------------------------------------------------------
  -- 3. SEED FOOD BUNDLES (IDEMPOTENT & FRESH DEADLINES)
  -- ------------------------------------------------------------------

  -- Bundles for Store 1: Nagpur Fresh Bakery
  IF NOT EXISTS (SELECT 1 FROM public.food_bundles WHERE restaurant_id = v_rest1_id AND title = 'Bakery Surprise Box (Demo)') THEN
    INSERT INTO public.food_bundles (restaurant_id, merchant_id, title, description, category, original_price, discounted_price, available_quantity, weight_kg, pickup_deadline, image_url, is_active)
    VALUES (
      v_rest1_id,
      v_merchant_id,
      'Bakery Surprise Box (Demo)',
      'Assorted morning sourdough loaf, two butter croissants, and seasonal fruit danish baked fresh today.',
      'Bakery',
      450.00,
      179.00,
      6,
      1.20,
      NOW() + INTERVAL '10 hours',
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      true
    );
  ELSE
    UPDATE public.food_bundles 
    SET pickup_deadline = NOW() + INTERVAL '10 hours', available_quantity = 6, is_active = true 
    WHERE restaurant_id = v_rest1_id AND title = 'Bakery Surprise Box (Demo)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.food_bundles WHERE restaurant_id = v_rest1_id AND title = 'Artisan Bread & Baguette Pack (Demo)') THEN
    INSERT INTO public.food_bundles (restaurant_id, merchant_id, title, description, category, original_price, discounted_price, available_quantity, weight_kg, pickup_deadline, image_url, is_active)
    VALUES (
      v_rest1_id,
      v_merchant_id,
      'Artisan Bread & Baguette Pack (Demo)',
      'Crispy crust French baguettes and garlic rosemary focaccia slices, perfect for dinner soup pairing.',
      'Bakery',
      320.00,
      129.00,
      4,
      0.90,
      NOW() + INTERVAL '8 hours',
      'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=800&q=80',
      true
    );
  ELSE
    UPDATE public.food_bundles 
    SET pickup_deadline = NOW() + INTERVAL '8 hours', available_quantity = 4, is_active = true 
    WHERE restaurant_id = v_rest1_id AND title = 'Artisan Bread & Baguette Pack (Demo)';
  END IF;

  -- Bundles for Store 2: Orange City Bites
  IF NOT EXISTS (SELECT 1 FROM public.food_bundles WHERE restaurant_id = v_rest2_id AND title = 'Daily Saver Meal Box (Demo)') THEN
    INSERT INTO public.food_bundles (restaurant_id, merchant_id, title, description, category, original_price, discounted_price, available_quantity, weight_kg, pickup_deadline, image_url, is_active)
    VALUES (
      v_rest2_id,
      v_merchant_id,
      'Daily Saver Meal Box (Demo)',
      'Hearty dinner package including paneer butter masala, fragrant jeera basmati rice, 3 rotis, and gulab jamun.',
      'Restaurant',
      399.00,
      159.00,
      8,
      1.50,
      NOW() + INTERVAL '6 hours',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      true
    );
  ELSE
    UPDATE public.food_bundles 
    SET pickup_deadline = NOW() + INTERVAL '6 hours', available_quantity = 8, is_active = true 
    WHERE restaurant_id = v_rest2_id AND title = 'Daily Saver Meal Box (Demo)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.food_bundles WHERE restaurant_id = v_rest2_id AND title = 'Evening Snack Bundle (Demo)') THEN
    INSERT INTO public.food_bundles (restaurant_id, merchant_id, title, description, category, original_price, discounted_price, available_quantity, weight_kg, pickup_deadline, image_url, is_active)
    VALUES (
      v_rest2_id,
      v_merchant_id,
      'Evening Snack Bundle (Demo)',
      'Fresh vegetable samosas, spiced kachoris, and freshly ground mint coriander chutney.',
      'Restaurant',
      220.00,
      89.00,
      10,
      0.80,
      NOW() + INTERVAL '5 hours',
      'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
      true
    );
  ELSE
    UPDATE public.food_bundles 
    SET pickup_deadline = NOW() + INTERVAL '5 hours', available_quantity = 10, is_active = true 
    WHERE restaurant_id = v_rest2_id AND title = 'Evening Snack Bundle (Demo)';
  END IF;

  -- Bundles for Store 3: Daily Harvest Cafe
  IF NOT EXISTS (SELECT 1 FROM public.food_bundles WHERE restaurant_id = v_rest3_id AND title = 'Cafe Combo Box (Demo)') THEN
    INSERT INTO public.food_bundles (restaurant_id, merchant_id, title, description, category, original_price, discounted_price, available_quantity, weight_kg, pickup_deadline, image_url, is_active)
    VALUES (
      v_rest3_id,
      v_merchant_id,
      'Cafe Combo Box (Demo)',
      'Fresh gourmet toasted panini sandwich, roasted vegetable salad bowl, and cold brew iced coffee.',
      'Restaurant',
      480.00,
      189.00,
      5,
      1.10,
      NOW() + INTERVAL '7 hours',
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80',
      true
    );
  ELSE
    UPDATE public.food_bundles 
    SET pickup_deadline = NOW() + INTERVAL '7 hours', available_quantity = 5, is_active = true 
    WHERE restaurant_id = v_rest3_id AND title = 'Cafe Combo Box (Demo)';
  END IF;

  -- Bundles for Store 4: Green Basket Foods
  IF NOT EXISTS (SELECT 1 FROM public.food_bundles WHERE restaurant_id = v_rest4_id AND title = 'Fresh Produce Pack (Demo)') THEN
    INSERT INTO public.food_bundles (restaurant_id, merchant_id, title, description, category, original_price, discounted_price, available_quantity, weight_kg, pickup_deadline, image_url, is_active)
    VALUES (
      v_rest4_id,
      v_merchant_id,
      'Fresh Produce Pack (Demo)',
      'Direct farm surplus produce including vine tomatoes, bell peppers, baby cucumbers, and fresh spinach.',
      'Grocery',
      340.00,
      139.00,
      12,
      3.00,
      NOW() + INTERVAL '16 hours',
      'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=800&q=80',
      true
    );
  ELSE
    UPDATE public.food_bundles 
    SET pickup_deadline = NOW() + INTERVAL '16 hours', available_quantity = 12, is_active = true 
    WHERE restaurant_id = v_rest4_id AND title = 'Fresh Produce Pack (Demo)';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.food_bundles WHERE restaurant_id = v_rest4_id AND title = 'Seasonal Fruit & Citrus Crate (Demo)') THEN
    INSERT INTO public.food_bundles (restaurant_id, merchant_id, title, description, category, original_price, discounted_price, available_quantity, weight_kg, pickup_deadline, image_url, is_active)
    VALUES (
      v_rest4_id,
      v_merchant_id,
      'Seasonal Fruit & Citrus Crate (Demo)',
      'Sweet Nagpur oranges, ripe Cavendish bananas, and seasonal pomegranates packed ready to eat.',
      'Grocery',
      420.00,
      169.00,
      7,
      2.50,
      NOW() + INTERVAL '14 hours',
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
      true
    );
  ELSE
    UPDATE public.food_bundles 
    SET pickup_deadline = NOW() + INTERVAL '14 hours', available_quantity = 7, is_active = true 
    WHERE restaurant_id = v_rest4_id AND title = 'Seasonal Fruit & Citrus Crate (Demo)';
  END IF;

  -- Bundles for Store 5: Midnight Munchies Deli
  IF NOT EXISTS (SELECT 1 FROM public.food_bundles WHERE restaurant_id = v_rest5_id AND title = 'Deli Healthy Snack & Juice Box (Demo)') THEN
    INSERT INTO public.food_bundles (restaurant_id, merchant_id, title, description, category, original_price, discounted_price, available_quantity, weight_kg, pickup_deadline, image_url, is_active)
    VALUES (
      v_rest5_id,
      v_merchant_id,
      'Deli Healthy Snack & Juice Box (Demo)',
      'Cold-pressed fruit juices, Greek yogurt granola parfait cup, and hummus pita dip pack.',
      'Other',
      380.00,
      159.00,
      6,
      1.30,
      NOW() + INTERVAL '12 hours',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      true
    );
  ELSE
    UPDATE public.food_bundles 
    SET pickup_deadline = NOW() + INTERVAL '12 hours', available_quantity = 6, is_active = true 
    WHERE restaurant_id = v_rest5_id AND title = 'Deli Healthy Snack & Juice Box (Demo)';
  END IF;

  RAISE NOTICE 'SUCCESS: Demo stores and surplus food bundles in Nagpur seeded successfully!';
END $$;
