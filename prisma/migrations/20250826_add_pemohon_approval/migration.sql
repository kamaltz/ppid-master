-- Add approval fields to pemohon table
ALTER TABLE "pemohon" ADD COLUMN "is_approved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "pemohon" ADD COLUMN "approved_by" TEXT;
ALTER TABLE "pemohon" ADD COLUMN "approved_at" TIMESTAMP(3);