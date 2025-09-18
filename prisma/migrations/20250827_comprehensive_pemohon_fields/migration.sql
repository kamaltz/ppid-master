-- Comprehensive migration to ensure all pemohon fields exist
-- Add missing fields to pemohon table with IF NOT EXISTS to prevent errors

-- Add approval fields
ALTER TABLE "pemohon" ADD COLUMN IF NOT EXISTS "is_approved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "pemohon" ADD COLUMN IF NOT EXISTS "approved_by" TEXT;
ALTER TABLE "pemohon" ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3);

-- Add profile fields
ALTER TABLE "pemohon" ADD COLUMN IF NOT EXISTS "pekerjaan" TEXT;
ALTER TABLE "pemohon" ADD COLUMN IF NOT EXISTS "ktp_image" TEXT;

-- Add missing fields to other tables if needed
ALTER TABLE "requests" ADD COLUMN IF NOT EXISTS "assigned_ppid_id" INTEGER;
ALTER TABLE "keberatan" ADD COLUMN IF NOT EXISTS "assigned_ppid_id" INTEGER;
ALTER TABLE "informasi_publik" ADD COLUMN IF NOT EXISTS "created_by" INTEGER;
ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "resource" TEXT;

-- Add foreign key constraints if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'requests_assigned_ppid_id_fkey'
    ) THEN
        ALTER TABLE "requests" ADD CONSTRAINT "requests_assigned_ppid_id_fkey" 
        FOREIGN KEY ("assigned_ppid_id") REFERENCES "ppid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'keberatan_assigned_ppid_id_fkey'
    ) THEN
        ALTER TABLE "keberatan" ADD CONSTRAINT "keberatan_assigned_ppid_id_fkey" 
        FOREIGN KEY ("assigned_ppid_id") REFERENCES "ppid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;