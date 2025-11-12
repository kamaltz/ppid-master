-- Simple SQL script to fix localhost URLs
-- Run with: psql -h localhost -U your_user -d your_database -f fix-localhost-simple.sql

-- Show current settings
SELECT 
  id,
  value->'general'->>'logo' as current_logo,
  value->'general'->>'favicon' as current_favicon
FROM "Setting" 
WHERE id = 1;

-- Fix localhost URLs
UPDATE "Setting" 
SET value = jsonb_set(
  jsonb_set(
    value,
    '{general,logo}',
    to_jsonb(replace(value->'general'->>'logo', 'http://localhost:3000', ''))
  ),
  '{general,favicon}',
  to_jsonb(replace(value->'general'->>'favicon', 'http://localhost:3000', ''))
)
WHERE id = 1;

-- Show updated settings
SELECT 
  id,
  value->'general'->>'logo' as updated_logo,
  value->'general'->>'favicon' as updated_favicon
FROM "Setting" 
WHERE id = 1;

-- Success message
\echo '✅ Localhost URLs have been fixed!'
