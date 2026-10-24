-- Migration: 20261023000000_init_discovery_tables.sql
-- Description: Core schema for Bangkok activity and event discovery system

-- 1. Bangkok Test Areas
CREATE TABLE IF NOT EXISTS bangkok_areas (
    id VARCHAR(64) PRIMARY KEY,
    name_en VARCHAR(200) NOT NULL,
    name_th VARCHAR(200) NOT NULL,
    description_en TEXT NOT NULL,
    description_th TEXT NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL CHECK (latitude BETWEEN 13.0 AND 14.5),
    longitude DECIMAL(10, 7) NOT NULL CHECK (longitude BETWEEN 99.5 AND 101.5),
    radius_km_default DECIMAL(5, 2) NOT NULL DEFAULT 5.0,
    tags TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Places and Venues
CREATE TABLE IF NOT EXISTS places (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_th VARCHAR(255),
    description TEXT NOT NULL,
    description_th TEXT,
    area_id VARCHAR(64) NOT NULL REFERENCES bangkok_areas(id) ON DELETE RESTRICT,
    address TEXT NOT NULL,
    address_th TEXT,
    latitude DECIMAL(10, 7) CHECK (latitude IS NULL OR latitude BETWEEN 13.0 AND 14.5),
    longitude DECIMAL(10, 7) CHECK (longitude IS NULL OR longitude BETWEEN 99.5 AND 101.5),
    categories TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    price_tier VARCHAR(32) NOT NULL DEFAULT 'unknown' CHECK (price_tier IN ('free', 'budget', 'moderate', 'expensive', 'unknown')),
    approx_min_price DECIMAL(10, 2) CHECK (approx_min_price IS NULL OR approx_min_price >= 0),
    approx_max_price DECIMAL(10, 2) CHECK (approx_max_price IS NULL OR approx_max_price >= 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'THB',
    source_url TEXT,
    source_name VARCHAR(255) NOT NULL,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status VARCHAR(32) NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'needs_review')),
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'temporarily_closed', 'permanently_closed')),
    opening_hours JSONB,
    typical_duration_minutes INTEGER,
    is_demo_fixture BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Events
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    title_th VARCHAR(255),
    description TEXT NOT NULL,
    description_th TEXT,
    place_id VARCHAR(64) REFERENCES places(id) ON DELETE SET NULL,
    venue_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    address_th TEXT,
    area_id VARCHAR(64) NOT NULL REFERENCES bangkok_areas(id) ON DELETE RESTRICT,
    latitude DECIMAL(10, 7) CHECK (latitude IS NULL OR latitude BETWEEN 13.0 AND 14.5),
    longitude DECIMAL(10, 7) CHECK (longitude IS NULL OR longitude BETWEEN 99.5 AND 101.5),
    categories TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    min_price DECIMAL(10, 2) CHECK (min_price IS NULL OR min_price >= 0),
    max_price DECIMAL(10, 2) CHECK (max_price IS NULL OR max_price >= 0),
    is_free BOOLEAN NOT NULL DEFAULT FALSE,
    currency VARCHAR(8) NOT NULL DEFAULT 'THB',
    source_url TEXT NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verification_status VARCHAR(32) NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'needs_review')),
    publication_status VARCHAR(32) NOT NULL DEFAULT 'published' CHECK (publication_status IN ('published', 'draft', 'archived')),
    event_status VARCHAR(32) NOT NULL DEFAULT 'scheduled' CHECK (event_status IN ('scheduled', 'rescheduled', 'cancelled', 'postponed')),
    is_demo_fixture BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_event_dates CHECK (end_datetime >= start_datetime)
);

-- 4. Recommendation Feedback
CREATE TABLE IF NOT EXISTS recommendation_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id VARCHAR(128),
    item_id VARCHAR(64) NOT NULL,
    feedback_type VARCHAR(32) NOT NULL CHECK (feedback_type IN ('useful', 'not_relevant', 'dismissed', 'visited')),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes for fast retrieval
CREATE INDEX IF NOT EXISTS idx_places_area_id ON places(area_id);
CREATE INDEX IF NOT EXISTS idx_places_status ON places(status);
CREATE INDEX IF NOT EXISTS idx_places_categories ON places USING GIN(categories);

CREATE INDEX IF NOT EXISTS idx_events_area_id ON events(area_id);
CREATE INDEX IF NOT EXISTS idx_events_publication_status ON events(publication_status);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_datetime, end_datetime);
CREATE INDEX IF NOT EXISTS idx_events_categories ON events USING GIN(categories);

-- 6. Row Level Security (RLS)
ALTER TABLE bangkok_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_feedback ENABLE ROW LEVEL SECURITY;

-- Read policies for public anonymous users
CREATE POLICY "Allow public read access to Bangkok test areas"
    ON bangkok_areas FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to active places"
    ON places FOR SELECT
    USING (status = 'active');

CREATE POLICY "Allow public read access to published events"
    ON events FOR SELECT
    USING (publication_status = 'published');

-- Feedback insert policy
CREATE POLICY "Allow public to insert recommendation feedback"
    ON recommendation_feedback FOR INSERT
    WITH CHECK (true);

-- Admin modification policies (service_role only)
CREATE POLICY "Allow service_role full control on bangkok_areas"
    ON bangkok_areas FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service_role full control on places"
    ON places FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow service_role full control on events"
    ON events FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
