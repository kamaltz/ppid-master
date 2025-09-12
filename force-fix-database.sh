#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

log_info "Force fixing PPID Master database schema..."

cd /opt/ppid

# Check current table structure
log_info "Current pemohon table structure:"
docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "\d pemohon"

# Force add pekerjaan column with different approaches
log_info "Attempting to add pekerjaan column..."

# Method 1: Direct ALTER TABLE
docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "
BEGIN;
ALTER TABLE pemohon ADD COLUMN IF NOT EXISTS pekerjaan VARCHAR(255);
COMMIT;
" 2>/dev/null && log_info "Method 1: ALTER TABLE succeeded" || log_warn "Method 1: ALTER TABLE failed"

# Method 2: Check and add if not exists
docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "
DO \$\$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pemohon' AND column_name = 'pekerjaan'
    ) THEN
        ALTER TABLE pemohon ADD COLUMN pekerjaan VARCHAR(255);
    END IF;
END \$\$;
" 2>/dev/null && log_info "Method 2: Conditional ADD succeeded" || log_warn "Method 2: Conditional ADD failed"

# Method 3: Recreate table if necessary
HAS_PEKERJAAN=$(docker-compose exec -T postgres psql -U postgres -d ppid_garut -t -c "
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'pemohon' AND column_name = 'pekerjaan';
" 2>/dev/null | tr -d ' \n' || echo "0")

if [ "$HAS_PEKERJAAN" != "1" ]; then
    log_warn "Column still missing, recreating table..."
    
    docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "
    BEGIN;
    
    -- Create backup
    CREATE TABLE pemohon_backup AS SELECT * FROM pemohon;
    
    -- Drop existing table
    DROP TABLE pemohon CASCADE;
    
    -- Recreate with proper schema
    CREATE TABLE pemohon (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        nama VARCHAR(255) NOT NULL,
        nik VARCHAR(16),
        no_telepon VARCHAR(20),
        alamat TEXT,
        pekerjaan VARCHAR(255),
        is_approved BOOLEAN DEFAULT false,
        approved_by VARCHAR(255),
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Restore data
    INSERT INTO pemohon (id, email, hashed_password, nama, nik, no_telepon, alamat, is_approved, approved_by, approved_at, created_at)
    SELECT id, email, hashed_password, nama, nik, no_telepon, alamat, is_approved, approved_by, approved_at, created_at
    FROM pemohon_backup;
    
    -- Fix sequence
    SELECT setval('pemohon_id_seq', COALESCE((SELECT MAX(id) FROM pemohon), 1));
    
    -- Recreate foreign key constraints
    ALTER TABLE requests ADD CONSTRAINT requests_pemohon_id_fkey 
        FOREIGN KEY (pemohon_id) REFERENCES pemohon(id);
    ALTER TABLE keberatan ADD CONSTRAINT keberatan_pemohon_id_fkey 
        FOREIGN KEY (pemohon_id) REFERENCES pemohon(id);
    
    -- Drop backup
    DROP TABLE pemohon_backup;
    
    COMMIT;
    " && log_info "Table recreation succeeded" || log_error "Table recreation failed"
fi

# Verify the fix
log_info "Verifying pekerjaan column..."
HAS_PEKERJAAN_FINAL=$(docker-compose exec -T postgres psql -U postgres -d ppid_garut -t -c "
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'pemohon' AND column_name = 'pekerjaan';
" 2>/dev/null | tr -d ' \n' || echo "0")

if [ "$HAS_PEKERJAAN_FINAL" = "1" ]; then
    log_info "✓ pekerjaan column now exists"
else
    log_error "✗ Failed to add pekerjaan column"
    exit 1
fi

# Show final table structure
log_info "Final pemohon table structure:"
docker-compose exec -T postgres psql -U postgres -d ppid_garut -c "\d pemohon"

# Regenerate Prisma client and restart
log_info "Regenerating Prisma client..."
docker-compose exec -T app npx prisma generate

log_info "Restarting application..."
docker-compose restart app

sleep 20

# Test the fix
log_info "Testing pemohon table access..."
TEST_RESULT=$(docker-compose exec -T postgres psql -U postgres -d ppid_garut -t -c "
SELECT id, email, nama, nik, no_telepon, alamat, pekerjaan, is_approved 
FROM pemohon LIMIT 1;
" 2>/dev/null || echo "FAILED")

if [[ "$TEST_RESULT" != "FAILED" ]]; then
    log_info "✓ pemohon table access working"
else
    log_error "✗ pemohon table access still failing"
fi

# Test registration
log_info "Testing registration endpoint..."
REGISTER_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
        "email":"test@example.com",
        "password":"Test123456",
        "nama":"Test User",
        "nik":"1234567890123456",
        "pekerjaan":"Test Job"
    }' 2>/dev/null || echo "000")

case $REGISTER_TEST in
    201) log_info "✓ Registration working (201 - Created)" ;;
    400) log_info "✓ Registration responding (400 - Validation error)" ;;
    409) log_info "✓ Registration responding (409 - Email exists)" ;;
    500) log_error "✗ Registration still failing (500 - Server error)" ;;
    *) log_warn "Registration status: $REGISTER_TEST" ;;
esac

log_info "Database fix completed!"
log_info "Try registering at: https://167.172.83.55/register"