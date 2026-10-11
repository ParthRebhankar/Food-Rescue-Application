-- ====================================================================
-- LOCAL FOOD WASTE SUBSCRIPTION PLANNER - SUPABASE DATABASE SCHEMA
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. PROFILES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'merchant')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index on email and role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- --------------------------------------------------------------------
-- 2. RESTAURANTS / STORES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Bakery', 'Restaurant', 'Grocery', 'Other')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  image_url TEXT,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_restaurants_merchant ON public.restaurants(merchant_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON public.restaurants(category);

-- --------------------------------------------------------------------
-- 3. FOOD BUNDLES TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Bakery', 'Restaurant', 'Grocery', 'Other')),
  original_price NUMERIC(10, 2) NOT NULL CHECK (original_price >= 0),
  discounted_price NUMERIC(10, 2) NOT NULL CHECK (discounted_price >= 0 AND discounted_price <= original_price),
  available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0),
  weight_kg NUMERIC(10, 2) NOT NULL CHECK (weight_kg > 0),
  pickup_deadline TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_food_bundles_restaurant ON public.food_bundles(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_food_bundles_merchant ON public.food_bundles(merchant_id);
CREATE INDEX IF NOT EXISTS idx_food_bundles_active ON public.food_bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_food_bundles_deadline ON public.food_bundles(pickup_deadline);

-- --------------------------------------------------------------------
-- 4. RESERVATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.food_bundles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  status TEXT NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved', 'picked_up', 'cancelled')),
  pickup_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  picked_up_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reservations_bundle ON public.reservations(bundle_id);
CREATE INDEX IF NOT EXISTS idx_reservations_customer ON public.reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

-- --------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile without role tampering" ON public.profiles;
CREATE POLICY "Users can update their own profile without role tampering" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND 
    role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RESTAURANTS POLICIES
DROP POLICY IF EXISTS "Restaurants are viewable by everyone" ON public.restaurants;
CREATE POLICY "Restaurants are viewable by everyone" 
  ON public.restaurants FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Merchants can insert restaurants" ON public.restaurants;
CREATE POLICY "Merchants can insert restaurants" 
  ON public.restaurants FOR INSERT 
  WITH CHECK (
    auth.uid() = merchant_id AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'merchant')
  );

DROP POLICY IF EXISTS "Merchants can update own restaurants" ON public.restaurants;
CREATE POLICY "Merchants can update own restaurants" 
  ON public.restaurants FOR UPDATE 
  USING (auth.uid() = merchant_id)
  WITH CHECK (auth.uid() = merchant_id);

DROP POLICY IF EXISTS "Merchants can delete own restaurants" ON public.restaurants;
CREATE POLICY "Merchants can delete own restaurants" 
  ON public.restaurants FOR DELETE 
  USING (auth.uid() = merchant_id);

-- FOOD BUNDLES POLICIES
DROP POLICY IF EXISTS "Bundles are viewable by everyone" ON public.food_bundles;
CREATE POLICY "Bundles are viewable by everyone" 
  ON public.food_bundles FOR SELECT 
  USING (is_active = true OR auth.uid() = merchant_id);

DROP POLICY IF EXISTS "Merchants can insert food bundles" ON public.food_bundles;
CREATE POLICY "Merchants can insert food bundles" 
  ON public.food_bundles FOR INSERT 
  WITH CHECK (
    auth.uid() = merchant_id AND 
    EXISTS (SELECT 1 FROM public.restaurants WHERE id = restaurant_id AND merchant_id = auth.uid())
  );

DROP POLICY IF EXISTS "Merchants can update own food bundles" ON public.food_bundles;
CREATE POLICY "Merchants can update own food bundles" 
  ON public.food_bundles FOR UPDATE 
  USING (auth.uid() = merchant_id)
  WITH CHECK (auth.uid() = merchant_id);

DROP POLICY IF EXISTS "Merchants can delete own food bundles" ON public.food_bundles;
CREATE POLICY "Merchants can delete own food bundles" 
  ON public.food_bundles FOR DELETE 
  USING (auth.uid() = merchant_id);

-- RESERVATIONS POLICIES
DROP POLICY IF EXISTS "Customers and merchants can view relevant reservations" ON public.reservations;
CREATE POLICY "Customers and merchants can view relevant reservations" 
  ON public.reservations FOR SELECT 
  USING (
    auth.uid() = customer_id OR 
    EXISTS (
      SELECT 1 FROM public.food_bundles b 
      WHERE b.id = reservations.bundle_id AND b.merchant_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Customers can insert their own reservations" ON public.reservations;
CREATE POLICY "Customers can insert their own reservations" 
  ON public.reservations FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

-- --------------------------------------------------------------------
-- 6. AUTH TRIGGER: AUTO-CREATE PROFILE ON SIGNUP
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
BEGIN
  -- Read role safely from raw_user_meta_data
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  IF v_role NOT IN ('customer', 'merchant') THEN
    v_role := 'customer';
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, v_full_name, NEW.email, v_role)
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      email = EXCLUDED.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --------------------------------------------------------------------
-- 7. SECURE ATOMIC POSTGRESQL FUNCTIONS
-- --------------------------------------------------------------------

-- Function: create_reservation
CREATE OR REPLACE FUNCTION public.create_reservation(
  p_bundle_id UUID,
  p_quantity INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_bundle RECORD;
  v_reservation RECORD;
  v_code TEXT;
  v_user_id UUID;
  v_total NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create a reservation';
  END IF;

  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be greater than zero';
  END IF;

  -- Lock row for update to prevent concurrent overselling
  SELECT * INTO v_bundle 
  FROM public.food_bundles 
  WHERE id = p_bundle_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Food bundle not found';
  END IF;

  IF NOT v_bundle.is_active THEN
    RAISE EXCEPTION 'This food bundle is no longer active';
  END IF;

  IF v_bundle.pickup_deadline <= NOW() THEN
    RAISE EXCEPTION 'The pickup window for this bundle has expired';
  END IF;

  IF v_bundle.available_quantity < p_quantity THEN
    RAISE EXCEPTION 'Insufficient quantity available (only % remaining)', v_bundle.available_quantity;
  END IF;

  -- Decrement inventory
  UPDATE public.food_bundles
  SET available_quantity = available_quantity - p_quantity,
      updated_at = NOW()
  WHERE id = p_bundle_id;

  -- Calculate total price
  v_total := v_bundle.discounted_price * p_quantity;

  -- Generate unique pickup code like 'PK-892147'
  v_code := 'PK-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 6));

  -- Insert reservation
  INSERT INTO public.reservations (
    bundle_id,
    customer_id,
    quantity,
    total_price,
    status,
    pickup_code,
    created_at
  ) VALUES (
    p_bundle_id,
    v_user_id,
    p_quantity,
    v_total,
    'reserved',
    v_code,
    NOW()
  ) RETURNING * INTO v_reservation;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation.id,
    'pickup_code', v_code,
    'quantity', v_reservation.quantity,
    'total_price', v_total
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: cancel_reservation
CREATE OR REPLACE FUNCTION public.cancel_reservation(
  p_reservation_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_res RECORD;
  v_user_id UUID;
  v_is_merchant BOOLEAN := false;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT r.*, b.merchant_id 
  INTO v_res
  FROM public.reservations r
  JOIN public.food_bundles b ON b.id = r.bundle_id
  WHERE r.id = p_reservation_id
  FOR UPDATE OF r;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found';
  END IF;

  -- Only customer or merchant can cancel
  IF v_res.customer_id <> v_user_id AND v_res.merchant_id <> v_user_id THEN
    RAISE EXCEPTION 'Unauthorized to cancel this reservation';
  END IF;

  IF v_res.status <> 'reserved' THEN
    RAISE EXCEPTION 'Only active reservations can be cancelled (current status: %)', v_res.status;
  END IF;

  -- Restore bundle inventory
  UPDATE public.food_bundles
  SET available_quantity = available_quantity + v_res.quantity,
      updated_at = NOW()
  WHERE id = v_res.bundle_id;

  -- Update reservation status
  UPDATE public.reservations
  SET status = 'cancelled',
      cancelled_at = NOW()
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'status', 'cancelled'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: confirm_pickup
CREATE OR REPLACE FUNCTION public.confirm_pickup(
  p_reservation_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_res RECORD;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT r.*, b.merchant_id 
  INTO v_res
  FROM public.reservations r
  JOIN public.food_bundles b ON b.id = r.bundle_id
  WHERE r.id = p_reservation_id
  FOR UPDATE OF r;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found';
  END IF;

  -- Only the merchant who owns the bundle can confirm pickup
  IF v_res.merchant_id <> v_user_id THEN
    RAISE EXCEPTION 'Only the merchant owning this listing can confirm pickup';
  END IF;

  IF v_res.status = 'picked_up' THEN
    RAISE EXCEPTION 'Reservation is already marked as picked up';
  END IF;

  IF v_res.status = 'cancelled' THEN
    RAISE EXCEPTION 'Cannot complete pickup for a cancelled reservation';
  END IF;

  -- Update reservation to picked_up
  UPDATE public.reservations
  SET status = 'picked_up',
      picked_up_at = NOW()
  WHERE id = p_reservation_id;

  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'status', 'picked_up',
    'picked_up_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
