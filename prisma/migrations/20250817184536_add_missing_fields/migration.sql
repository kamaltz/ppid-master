-- Add missing fields to existing tables

-- Add assigned_ppid_id to requests table (rename from assigned_to)
ALTER TABLE "public"."requests" DROP CONSTRAINT IF EXISTS "requests_assigned_to_fkey";
ALTER TABLE "public"."requests" DROP COLUMN IF EXISTS "assigned_to";
ALTER TABLE "public"."requests" ADD COLUMN "assigned_ppid_id" INTEGER;
ALTER TABLE "public"."requests" ADD COLUMN "created_by" INTEGER;

-- Add assigned_ppid_id to keberatan table (rename from assigned_to)  
ALTER TABLE "public"."keberatan" DROP CONSTRAINT IF EXISTS "keberatan_assigned_to_fkey";
ALTER TABLE "public"."keberatan" DROP COLUMN IF EXISTS "assigned_to";
ALTER TABLE "public"."keberatan" ADD COLUMN "assigned_ppid_id" INTEGER;
ALTER TABLE "public"."keberatan" ADD COLUMN "created_by" INTEGER;

-- Add missing field to activity_logs
ALTER TABLE "public"."activity_logs" ADD COLUMN IF NOT EXISTS "resource" TEXT;

-- Add missing field to informasi_publik
ALTER TABLE "public"."informasi_publik" ADD COLUMN IF NOT EXISTS "created_by" INTEGER;

-- Create PpidChat table
CREATE TABLE IF NOT EXISTS "public"."ppid_chats" (
    "id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "attachments" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ppid_chats_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_assigned_ppid_id_fkey" FOREIGN KEY ("assigned_ppid_id") REFERENCES "public"."ppid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."keberatan" ADD CONSTRAINT "keberatan_assigned_ppid_id_fkey" FOREIGN KEY ("assigned_ppid_id") REFERENCES "public"."ppid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."ppid_chats" ADD CONSTRAINT "ppid_chats_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."ppid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."ppid_chats" ADD CONSTRAINT "ppid_chats_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "public"."ppid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;