-- Add role and permissions columns to admin table
ALTER TABLE admin ADD COLUMN role VARCHAR(50) DEFAULT 'ADMIN';
ALTER TABLE admin ADD COLUMN permissions TEXT;

-- Update existing admin records with default role
UPDATE admin SET role = 'ADMIN' WHERE role IS NULL;