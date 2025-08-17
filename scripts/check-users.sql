-- Check existing pemohon users
SELECT id, email, nama FROM pemohon LIMIT 5;

-- Check all tables to find users
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%user%' OR table_name LIKE '%pemohon%';