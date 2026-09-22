-- Additional tables for Phase 2: Bookings, Reviews, Provider Verification
-- Run in Supabase SQL Editor

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    service_name TEXT NOT NULL,
    booking_time TIMESTAMPTZ NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    address TEXT,
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(booking_id)
);

-- ============================================
-- PROVIDER VERIFICATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.provider_verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    email_verified BOOLEAN DEFAULT FALSE,
    documents_verified BOOLEAN DEFAULT FALSE,
    background_check_passed BOOLEAN DEFAULT FALSE,
    verification_step TEXT DEFAULT 'email_pending',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_time ON public.bookings(booking_time);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON public.reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_provider_verification_provider ON public.provider_verification(provider_id);

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
DECLARE
    tables TEXT[] := ARRAY['bookings', 'reviews', 'provider_verification'];
    t TEXT;
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- ============================================
-- RLS POLICIES: BOOKINGS
-- ============================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own bookings"
ON public.bookings FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Customers can insert own bookings"
ON public.bookings FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Providers can view bookings"
ON public.bookings FOR SELECT
USING (provider_id = auth.uid());

CREATE POLICY "Providers can update bookings"
ON public.bookings FOR UPDATE
USING (provider_id = auth.uid())
WITH CHECK (provider_id = auth.uid());

-- ============================================
-- RLS POLICIES: REVIEWS
-- ============================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reviews"
ON public.reviews FOR SELECT
USING (reviewer_id = auth.uid() OR reviewee_id = auth.uid());

CREATE POLICY "Users can insert own reviews"
ON public.reviews FOR INSERT
WITH CHECK (reviewer_id = auth.uid());

-- ============================================
-- RLS POLICIES: PROVIDER VERIFICATION
-- ============================================
ALTER TABLE public.provider_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Provider can view own verification"
ON public.provider_verification FOR SELECT
USING (provider_id = auth.uid());

CREATE POLICY "Provider can update own verification"
ON public.provider_verification FOR UPDATE
USING (provider_id = auth.uid())
WITH CHECK (provider_id = auth.uid());

-- ============================================
-- SERVICES TABLE (if not created yet)
-- ============================================
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    duration INTEGER NOT NULL CHECK (duration > 0),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can view own services"
ON public.services FOR SELECT
USING (provider_id = auth.uid());

CREATE POLICY "Providers can insert own services"
ON public.services FOR INSERT
WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can update own services"
ON public.services FOR UPDATE
USING (provider_id = auth.uid())
WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Providers can delete own services"
ON public.services FOR DELETE
USING (provider_id = auth.uid());

CREATE POLICY "Anyone can view active services"
ON public.services FOR SELECT
USING (is_active = TRUE);
