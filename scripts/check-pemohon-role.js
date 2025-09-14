const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkPemohonRole() {
  try {
    console.log('🔍 Checking pemohon role in database...');
    
    const pemohon = await prisma.pemohon.findFirst();
    
    if (!pemohon) {
      console.log('❌ No pemohon found');
      return;
    }
    
    console.log(`👤 Pemohon found:`);
    console.log(`   ID: ${pemohon.id}`);
    console.log(`   Name: ${pemohon.nama}`);
    console.log(`   Email: ${pemohon.email}`);
    
    // Check what's stored in localStorage (simulated)
    console.log('\n🔑 Expected JWT payload should contain:');
    console.log(`   role: "Pemohon" or "PEMOHON"`);
    
    console.log('\n💡 If role is "PEMOHON" (uppercase), the fix should work now.');
    console.log('   Refresh the browser and check console again.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPemohonRole();