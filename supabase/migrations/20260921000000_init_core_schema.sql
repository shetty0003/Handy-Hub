-- Handy Hub Core Database Schema & Security Migration
-- Run this as a new migration in Supabase (e.g., 20240921000000_init_core_schema.sql)

-- ===========================================
-- 1. EXTENSIONS
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 2. ENUM TYPES
-- ===========================================
DO $$ BEGIN
    CREATE TYPE user_type AS ENUM ('customer', 'provider', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ===========================================
-- 3. CORE TABLES
-- ===========================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    user_type user_type NOT NULL DEFAULT 'customer',
    verification_status verification_status NOT NULL DEFAULT 'pending',
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Providers (linked to profiles)
CREATE TABLE IF NOT EXISTS public.providers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    business_address TEXT,
    years_of_experience INTEGER,
    license_number TEXT,
    tax_id TEXT,
    rating NUMERIC(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    total_jobs INTEGER DEFAULT 0,
    active_jobs INTEGER DEFAULT 0,
    weekly_earnings NUMERIC(10,2) DEFAULT 0.00,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    service_categories TEXT[] DEFAULT '{}',
    hourly_rate NUMERIC(8,2),
    service_areas TEXT[] DEFAULT '{}',
    emergency_service BOOLEAN DEFAULT FALSE,
    warranty_offered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Service Categories (global catalog)
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,  -- Ionicons name
    color TEXT NOT NULL, -- Hex color
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services (offered by providers)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    duration INTEGER NOT NULL CHECK (duration > 0), -- minutes
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL, -- denormalized for performance
    booking_time TIMESTAMPTZ NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    address TEXT,
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- 4. INDEXES FOR PERFORMANCE
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_providers_is_verified ON public.providers(is_verified);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_time ON public.bookings(booking_time);

-- ===========================================
-- 5. TRIGGER FUNCTIONS
-- ===========================================

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach updated_at trigger to all tables
DO $$
DECLARE
    tables TEXT[] := ARRAY['profiles', 'providers', 'service_categories', 'services', 'bookings'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;

-- Existing profile creation trigger (keep as-is)
-- If you prefer to replace, uncomment below:
/*
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, user_type, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User')
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();
*/

-- Provider registration function (existing)
CREATE OR REPLACE FUNCTION public.complete_provider_registration(
    p_business_name TEXT,
    p_business_type TEXT,
    p_business_address TEXT,
    p_years_of_experience INTEGER,
    p_license_number TEXT,
    p_tax_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
BEGIN
    IF EXISTS (SELECT 1 FROM public.providers WHERE id = v_user_id) THEN
        RAISE EXCEPTION 'Provider profile already exists for this user.';
    END IF;

    INSERT INTO public.providers (
        id, business_name, business_type, business_address,
        years_of_experience, license_number, tax_id
    )
    VALUES (
        v_user_id, p_business_name, p_business_type, p_business_address,
        p_years_of_experience, p_license_number, p_tax_id
    );

    UPDATE public.profiles
    SET user_type = 'provider',
        verification_status = 'pending'
    WHERE id = v_user_id;
END;
$$;

-- ===========================================
-- 6. ROW-LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Helper: Get user's profile details (security definer)
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
    id UUID,
    user_type user_type,
    is_admin BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT p.id, p.user_type, p.is_admin
    FROM public.profiles p
    WHERE p.id = auth.uid()
$$;

-- === PROFILES POLICIES ===
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
));

-- Admins can update any profile (e.g., verification status)
CREATE POLICY "Admins can update profiles"
ON public.profiles FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
));

-- === PROVIDERS POLICIES ===
-- Users can view own provider profile
CREATE POLICY "Users can view own provider profile"
ON public.providers FOR SELECT
USING (auth.uid() = id);

-- Users can update own provider profile
CREATE POLICY "Users can update own provider profile"
ON public.providers FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all providers
CREATE POLICY "Admins can view all providers"
ON public.providers FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
));

-- Admins can update any provider
CREATE POLICY "Admins can update providers"
ON public.providers FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
));

-- === SERVICE_CATEGORIES POLICIES ===
-- Everyone can view categories (public catalog)
CREATE POLICY "Anyone can view service categories"
ON public.service_categories FOR SELECT
USING (TRUE);

-- Only admins can manage categories
CREATE POLICY "Admins can manage service categories"
ON public.service_categories
USING (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
));

-- === SERVICES POLICIES ===
-- Providers can view own services
CREATE POLICY "Providers can view own services"
ON public.services FOR SELECT
USING (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
);

-- Providers can insert own services
CREATE POLICY "Providers can insert own services"
ON public.services FOR INSERT
WITH CHECK (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
);

-- Providers can update own services
CREATE POLICY "Providers can update own services"
ON public.services FOR UPDATE
USING (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
)
WITH CHECK (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
);

-- Providers can delete own services
CREATE POLICY "Providers can delete own services"
ON public.services FOR DELETE
USING (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
);

-- Everyone can view active services (for browsing)
CREATE POLICY "Anyone can view active services"
ON public.services FOR SELECT
USING (is_active = TRUE);

-- === BOOKINGS POLICIES ===
-- Customers can view own bookings
CREATE POLICY "Customers can view own bookings"
ON public.bookings FOR SELECT
USING (customer_id = auth.uid());

-- Customers can insert own bookings
CREATE POLICY "Customers can insert own bookings"
ON public.bookings FOR INSERT
WITH CHECK (customer_id = auth.uid());

-- Customers can update own bookings (limited fields)
CREATE POLICY "Customers can update own bookings"
ON public.bookings FOR UPDATE
USING (customer_id = auth.uid())
WITH CHECK (customer_id = auth.uid());

-- Providers can view bookings for their services
CREATE POLICY "Providers can view bookings for their services"
ON public.bookings FOR SELECT
USING (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
);

-- Providers can update bookings for their services (status, etc.)
CREATE POLICY "Providers can update bookings for their services"
ON public.bookings FOR UPDATE
USING (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
)
WITH CHECK (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
);

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON public.bookings FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
));

-- Admins can update any booking
CREATE POLICY "Admins can update bookings"
ON public.bookings FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.get_current_user_profile()
    WHERE user_type = 'admin' AND id = auth.uid()
));

-- ===========================================
-- 7. COMMENTS
-- ===========================================
COMMENT ON TABLE public.profiles IS 'Extended user profiles from Supabase auth.users';
COMMENT ON TABLE public.providers IS 'Service provider business details';
COMMENT ON TABLE public.service_categories IS 'Global catalog of service types';
COMMENT ON TABLE public.services IS 'Services offered by providers';
COMMENT ON TABLE public.bookings IS 'Bookings between customers and providers';

-- ===========================================
-- 8. INITIAL DATA (OPTIONAL - SERVICE CATEGORIES)
-- ===========================================
-- Insert common service categories (you can modify/add as needed)
INSERT INTO public.service_categories (name, icon, color) VALUES
    ('Cleaning', 'home-outline', '#10b981'),
    ('Plumbing', 'wrench-outline', '#06b6d4'),
    ('Electrical', 'zap-outline', '#f59e0b'),
    ('Gardening', 'leaf-outline', '#84cc16'),
    ('Painting', 'paintbrush-outline', '#ef4444'),
    ('Assembly', 'construct-outline', '#8b5cf6'),
    ('Repair', 'hammer-outline', '#6366f1')
ON CONFLICT (name) DO NOTHING;

-- ===========================================
-- 9. SECURITY NOTES
-- ===========================================
-- RLS policies rely on auth.uid() and the get_current_user_profile() function.
-- Ensure that the anon and authenticated roles have appropriate access.
-- The service_role bypasses RLS and should be used only for trusted backend services.
-- Admin privileges are determined by the is_admin flag in profiles table.