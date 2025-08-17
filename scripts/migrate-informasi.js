import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateInformasi() {
  try {
    console.log('Adding missing fields to informasi_publik table...');
    
    // Add the missing columns
    await prisma.$executeRaw`
      ALTER TABLE informasi_publik 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
      ADD COLUMN IF NOT EXISTS thumbnail TEXT,
      ADD COLUMN IF NOT EXISTS jadwal_publish TIMESTAMP;
    `;
    
    // Update existing records to have draft status
    await prisma.$executeRaw`
      UPDATE informasi_publik SET status = 'draft' WHERE status IS NULL OR status = '';
    `;
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateInformasi();