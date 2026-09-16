-- Extensions PakFix relies on.
--
-- unaccent and pg_trgm back the technician and service search: "Muhammad"
-- should match "Muhammed", and an area name typed without diacritics should
-- still find the right row.
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
-- Used for gen_random_uuid() where a default is wanted at the database level.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
