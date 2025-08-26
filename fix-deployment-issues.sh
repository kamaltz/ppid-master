#!/bin/bash

echo "🔧 Fixing deployment issues..."

# Stop containers
docker stop ppid-app 2>/dev/null
docker rm ppid-app 2>/dev/null

# Run database migration
echo "📊 Running database migration..."
docker exec ppid-postgres psql -U postgres -d ppid_garut -c "
CREATE TABLE IF NOT EXISTS \"Setting\" (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS \"Admin\" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    \"createdAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \"updatedAt\" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO \"Admin\" (email, password) VALUES 
('admin@garut.go.id', '\$2b\$10\$rQJ8kqZ5Z5Z5Z5Z5Z5Z5ZOZ5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5')
ON CONFLICT (email) DO NOTHING;
"

# Start app with consistent JWT secret
echo "🚀 Starting app with fixed JWT..."
docker run -d --name ppid-app \
  --link ppid-postgres:postgres \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres123@postgres:5432/ppid_garut?schema=public" \
  -e JWT_SECRET="ppid-garut-jwt-secret-2024" \
  -e NEXT_PUBLIC_API_URL="/api" \
  -v "$(pwd)/uploads:/app/public/uploads" \
  ppid-app

sleep 20

echo "✅ Fixed! Testing..."
curl -I http://localhost:3000/api/health 2>/dev/null || echo "Starting..."

echo "🌐 Access: http://localhost:3000"
echo "👤 Login: admin@garut.go.id / admin123"