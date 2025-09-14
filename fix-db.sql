-- Fix database migration issue
-- Run this in PostgreSQL as postgres user

-- 1. Drop all tables
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;

-- 2. Drop migration history
DROP TABLE IF EXISTS _prisma_migrations CASCADE;

-- 3. Show remaining tables (should be empty)
SELECT tablename FROM pg_tables WHERE schemaname = 'public';