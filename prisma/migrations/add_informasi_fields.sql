-- Add missing fields to informasi_publik table
ALTER TABLE informasi_publik 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS thumbnail TEXT,
ADD COLUMN IF NOT EXISTS jadwal_publish TIMESTAMP;

-- Update existing records to have draft status if null
UPDATE informasi_publik SET status = 'draft' WHERE status IS NULL;