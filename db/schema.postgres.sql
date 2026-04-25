-- Campus Stray Cat Map - PostgreSQL schema
-- Target: PostgreSQL 14+

BEGIN;

-- Users
CREATE TABLE IF NOT EXISTS public.users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(32) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cats
CREATE TABLE IF NOT EXISTS public.cats (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  sex TEXT NOT NULL DEFAULT 'unknown' CHECK (sex IN ('unknown', 'male', 'female')),
  description VARCHAR(500),
  neutered BOOLEAN NOT NULL DEFAULT FALSE,
  created_by BIGINT REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Photos for cats
CREATE TABLE IF NOT EXISTS public.cat_photos (
  id BIGSERIAL PRIMARY KEY,
  cat_id BIGINT NOT NULL REFERENCES public.cats(id) ON UPDATE CASCADE ON DELETE CASCADE,
  url VARCHAR(512) NOT NULL,
  uploaded_by BIGINT REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sightings (appear/seen reports)
CREATE TABLE IF NOT EXISTS public.sightings (
  id BIGSERIAL PRIMARY KEY,
  cat_id BIGINT NOT NULL REFERENCES public.cats(id) ON UPDATE CASCADE ON DELETE CASCADE,
  reporter_id BIGINT REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  note VARCHAR(500),
  happened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_sightings_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT ck_sightings_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- Feeding points
CREATE TABLE IF NOT EXISTS public.feeding_points (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  description VARCHAR(500),
  created_by BIGINT REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ck_feeding_points_latitude CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT ck_feeding_points_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- Feeding events
CREATE TABLE IF NOT EXISTS public.feeding_events (
  id BIGSERIAL PRIMARY KEY,
  feeding_point_id BIGINT NOT NULL REFERENCES public.feeding_points(id) ON UPDATE CASCADE ON DELETE CASCADE,
  feeder_id BIGINT REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  food_type VARCHAR(50),
  amount VARCHAR(50),
  note VARCHAR(500),
  fed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index design
CREATE INDEX IF NOT EXISTS idx_cats_name ON public.cats (name);
CREATE INDEX IF NOT EXISTS idx_cats_created_at ON public.cats (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cat_photos_cat_id_created_at ON public.cat_photos (cat_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sightings_cat_id_happened_at ON public.sightings (cat_id, happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_sightings_happened_at ON public.sightings (happened_at DESC);
CREATE INDEX IF NOT EXISTS idx_sightings_lat_lng ON public.sightings (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_feeding_points_name ON public.feeding_points (name);
CREATE INDEX IF NOT EXISTS idx_feeding_points_lat_lng ON public.feeding_points (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_feeding_events_point_id_fed_at ON public.feeding_events (feeding_point_id, fed_at DESC);

COMMIT;

