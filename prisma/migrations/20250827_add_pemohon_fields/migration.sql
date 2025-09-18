-- Add missing fields to pemohon table
ALTER TABLE "pemohon" ADD COLUMN IF NOT EXISTS "pekerjaan" TEXT;
ALTER TABLE "pemohon" ADD COLUMN IF NOT EXISTS "ktp_image" TEXT;