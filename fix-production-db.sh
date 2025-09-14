#!/bin/bash

echo "🔧 Fixing production database migration issue..."

# 1. Remove problematic migration
echo "1. Removing problematic migration..."
rm -rf prisma/migrations/20241220000001_fix_settings_structure
echo "✓ Problematic migration removed"

# 2. Connect to PostgreSQL and drop all tables
echo "2. Dropping all tables..."
psql -h localhost -U postgres -d ppid_db -c "
DO \$\$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END \$\$;
"

# 3. Drop and recreate _prisma_migrations table
echo "3. Resetting migration history..."
psql -h localhost -U postgres -d ppid_db -c "DROP TABLE IF EXISTS _prisma_migrations CASCADE;"

# 4. Deploy migrations
echo "4. Deploying migrations..."
npx prisma migrate deploy

# 5. Generate Prisma client
echo "5. Generating Prisma client..."
npx prisma generate

# 6. Run seed
echo "6. Running seed..."
npm run seed

echo "🎉 Database fixed successfully!"