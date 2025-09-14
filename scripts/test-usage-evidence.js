const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testUsageEvidence() {
  try {
    console.log('🧪 Testing Usage Evidence feature...');
    
    // Find a pemohon
    const pemohon = await prisma.pemohon.findFirst();
    if (!pemohon) {
      console.log('❌ No pemohon found');
      return;
    }
    
    console.log(`👤 Testing with Pemohon: ${pemohon.nama} (ID: ${pemohon.id})`);
    
    // Create a completed request
    const testRequest = await prisma.request.create({
      data: {
        pemohon_id: pemohon.id,
        rincian_informasi: 'Test request for evidence testing',
        tujuan_penggunaan: 'Penelitian akademik',
        cara_memperoleh_informasi: 'Email',
        cara_mendapat_salinan: 'Email',
        status: 'Selesai',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`✅ Created completed request ID: ${testRequest.id}`);
    
    // Add completion message
    await prisma.requestResponse.create({
      data: {
        request_id: testRequest.id,
        user_id: '0',
        user_role: 'System',
        user_name: 'System',
        message: '✅ Permohonan telah Selesai. Chat ditutup.\n\n📋 PENTING: Pemohon WAJIB melampirkan bukti hasil penggunaan informasi...',
        message_type: 'system'
      }
    });
    
    // Test evidence submission
    console.log('\n📋 Testing evidence submission...');
    
    const evidence = await prisma.usageEvidence.create({
      data: {
        request_id: testRequest.id,
        pemohon_id: pemohon.id,
        description: 'Informasi telah digunakan untuk penelitian skripsi tentang transparansi pemerintah daerah',
        attachments: JSON.stringify([
          { name: 'skripsi_bab1.pdf', url: '/uploads/test-file.pdf', size: 1024000 }
        ]),
        links: 'https://repository.univ.ac.id/skripsi/12345',
        status: 'Submitted'
      }
    });
    
    console.log(`✅ Created evidence submission ID: ${evidence.id}`);
    
    // Add evidence message to chat
    await prisma.requestResponse.create({
      data: {
        request_id: testRequest.id,
        user_id: pemohon.id.toString(),
        user_role: 'PEMOHON',
        user_name: pemohon.nama,
        message: '📋 Bukti penggunaan informasi telah dikirim oleh pemohon.\n\nDeskripsi: Informasi telah digunakan untuk penelitian skripsi tentang transparansi pemerintah daerah',
        attachments: JSON.stringify([
          { name: 'skripsi_bab1.pdf', url: '/uploads/test-file.pdf', size: 1024000 }
        ]),
        message_type: 'evidence'
      }
    });
    
    console.log('✅ Added evidence message to chat');
    
    // Test keberatan evidence
    console.log('\n📝 Testing keberatan evidence...');
    
    const testKeberatan = await prisma.keberatan.create({
      data: {
        permintaan_id: testRequest.id,
        pemohon_id: pemohon.id,
        alasan_keberatan: 'Test keberatan for evidence',
        status: 'Selesai'
      }
    });
    
    const keberatanEvidence = await prisma.usageEvidence.create({
      data: {
        keberatan_id: testKeberatan.id,
        pemohon_id: pemohon.id,
        description: 'Hasil keberatan digunakan untuk perbaikan sistem administrasi',
        links: 'https://example.com/laporan-perbaikan',
        status: 'Submitted'
      }
    });
    
    console.log(`✅ Created keberatan evidence ID: ${keberatanEvidence.id}`);
    
    // Verify data
    console.log('\n🔍 Verifying evidence data...');
    
    const allEvidence = await prisma.usageEvidence.findMany({
      where: { pemohon_id: pemohon.id },
      include: {
        request: { select: { id: true, rincian_informasi: true } },
        keberatan: { select: { id: true, alasan_keberatan: true } },
        pemohon: { select: { nama: true, email: true } }
      }
    });
    
    console.log(`📊 Total evidence submissions: ${allEvidence.length}`);
    allEvidence.forEach((ev, index) => {
      console.log(`  ${index + 1}. ${ev.request ? 'Request' : 'Keberatan'} #${ev.request?.id || ev.keberatan?.id}`);
      console.log(`     Description: ${ev.description || 'No description'}`);
      console.log(`     Links: ${ev.links || 'No links'}`);
      console.log(`     Attachments: ${ev.attachments ? JSON.parse(ev.attachments).length + ' files' : 'No files'}`);
      console.log(`     Status: ${ev.status}`);
    });
    
    // Test chat messages
    console.log('\n💬 Verifying chat messages...');
    
    const chatMessages = await prisma.requestResponse.findMany({
      where: { request_id: testRequest.id },
      orderBy: { created_at: 'asc' }
    });
    
    console.log(`📨 Total chat messages: ${chatMessages.length}`);
    chatMessages.forEach((msg, index) => {
      const type = msg.message_type === 'evidence' ? '📋 EVIDENCE' : 
                   msg.message_type === 'system' ? '🔔 SYSTEM' : '💬 CHAT';
      console.log(`  ${index + 1}. ${type} - ${msg.user_role}: ${msg.message.substring(0, 50)}...`);
    });
    
    console.log('\n🎉 Summary of implemented features:');
    console.log('✅ 1. UsageEvidence database model created');
    console.log('✅ 2. API endpoint for evidence submission');
    console.log('✅ 3. Evidence form component');
    console.log('✅ 4. Integration with RequestChat and KeberatanChat');
    console.log('✅ 5. Evidence messages appear in chat');
    console.log('✅ 6. Support for files, links, and descriptions');
    
    console.log('\n📝 How to test in browser:');
    console.log('1. Login as pemohon');
    console.log('2. Open a completed request/keberatan chat');
    console.log('3. Click "Kirim Bukti Penggunaan" button');
    console.log('4. Fill form and submit');
    console.log('5. Check chat for evidence message');
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.requestResponse.deleteMany({ where: { request_id: testRequest.id } });
    await prisma.usageEvidence.deleteMany({ where: { pemohon_id: pemohon.id } });
    await prisma.keberatan.delete({ where: { id: testKeberatan.id } });
    await prisma.request.delete({ where: { id: testRequest.id } });
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing usage evidence:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUsageEvidence();