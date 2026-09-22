-- Complete HandyHub Schema Setup
-- Run this to add missing tables, indexes, and policies
-- Handles existing objects gracefully

-- ============================================
-- 1. CREATE MISSING TABLES
-- ============================================

-- Service Categories (if not exists)
CREATE TABLE IF NOT EXISTS public.service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services (if not exists)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    duration INTEGER NOT NULL CHECK (duration > 0),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. CREATE MISSING INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_services_provider_id ON public.services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);

-- ============================================
-- 3. ADD MISSING SERVICE CATEGORIES
-- ============================================

INSERT INTO public.service_categories (name, icon, color) VALUES
    ('Cleaning', 'home-outline', '#10b981'),
    ('Plumbing', 'wrench-outline', '#06b6d4'),
    ('Electrical', 'zap-outline', '#f59e0b'),
    ('Gardening', 'leaf-outline', '#84cc16'),
    ('Painting', 'paintbrush-outline', '#ef4444'),
    ('Assembly', 'construct-outline', '#8b5cf6'),
    ('Repair', 'hammer-outline', '#6366f1')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 4. ENABLE RLS ON NEW TABLES
-- ============================================

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. ADD MISSING RLS POLICIES (service_categories)
-- ============================================

DROP POLICY IF EXISTS "Anyone can view service categories" ON public.service_categories;
CREATE POLICY "Anyone can view service categories"
ON public.service_categories FOR SELECT
USING (TRUE);

-- ============================================
-- 6. ADD MISSING RLS POLICIES (services)
-- ============================================

-- Providers can view own services
DROP POLICY IF EXISTS "Providers can view own services" ON public.services;
CREATE POLICY "Providers can view own services"
ON public.services FOR SELECT
USING (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
);

-- Providers can insert own services
DROP POLICY IF EXISTS "Providers can insert own services" ON public.services;
CREATE POLICY "Providers can insert own services"
ON public.services FOR INSERT
WITH CHECK (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
);

-- Providers can update own services
DROP POLICY IF EXISTS "Providers can update own services" ON public.services;
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
DROP POLICY IF EXISTS "Providers can delete own services" ON public.services;
CREATE POLICY "Providers can delete own services"
ON public.services FOR DELETE
USING (
    provider_id = (
        SELECT id FROM public.providers WHERE id = auth.uid() LIMIT 1
    )
);

-- Everyone can view active services
DROP POLICY IF EXISTS "Anyone can view active services" ON public.services;
CREATE POLICY "Anyone can view active services"
ON public.services FOR SELECT
USING (is_active = TRUE);

-- ============================================
-- 7. ADD UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- 8. VERIFY SETUP
-- ============================================

SELECT 'Tables created:' as status;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT 'Service categories seed data:' as status;
SELECT * FROM public.service_categories;