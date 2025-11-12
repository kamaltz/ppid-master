#!/bin/bash

# Script to fix localhost URLs in database
# Run this on production server

echo "🔧 Fixing localhost URLs in database..."

# Get database connection details from environment
DB_URL="${DATABASE_URL}"

if [ -z "$DB_URL" ]; then
    echo "❌ DATABASE_URL not set"
    exit 1
fi

# Extract connection details
DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📊 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo "🖥️  Host: $DB_HOST:$DB_PORT"

# SQL to fix localhost URLs
SQL="
UPDATE \"Setting\" 
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      value,
      '{general,logo}',
      to_jsonb(replace(value->'general'->>'logo', 'http://localhost:3000', ''))
    ),
    '{general,favicon}',
    to_jsonb(replace(value->'general'->>'favicon', 'http://localhost:3000', ''))
  ),
  '{hero,slides}',
  (
    SELECT jsonb_agg(
      jsonb_set(
        slide,
        '{image}',
        to_jsonb(replace(slide->>'image', 'http://localhost:3000', ''))
      )
    )
    FROM jsonb_array_elements(value->'hero'->'slides') AS slide
  )
)
WHERE id = 1;

SELECT 
  value->'general'->>'logo' as logo,
  value->'general'->>'favicon' as favicon
FROM \"Setting\" 
WHERE id = 1;
"

# Execute SQL
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$SQL"

if [ $? -eq 0 ]; then
    echo "✅ Database updated successfully!"
else
    echo "❌ Failed to update database"
    exit 1
fi
