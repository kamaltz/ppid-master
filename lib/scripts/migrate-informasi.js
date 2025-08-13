require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateInformasi() {
  try {
    console.log('🔄 Migrating informasi_publik table...');
    
    // Add missing columns using raw SQL
    await prisma.$executeRaw`
      ALTER TABLE informasi_publik 
      ADD COLUMN IF NOT EXISTS file_attachments TEXT,
      ADD COLUMN IF NOT EXISTS links TEXT,
      ADD COLUMN IF NOT EXISTS tanggal_posting TIMESTAMP DEFAULT NOW()
    `;
    
    console.log('✅ Migration completed successfully');
    
    // Test the table structure
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'informasi_publik'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Current table structure:');
    console.table(result);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateInformasi();