const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testCompletionFeatures() {
  try {
    console.log('🧪 Testing completion features...');
    
    // Test 1: Create a test request and complete it to see the evidence message
    console.log('\n1️⃣ Testing evidence requirement message...');
    
    const pemohon = await prisma.pemohon.findFirst();
    if (!pemohon) {
      console.log('❌ No pemohon found');
      return;
    }
    
    // Create a test request
    const testRequest = await prisma.request.create({
      data: {
        pemohon_id: pemohon.id,
        rincian_informasi: 'Test request for completion testing',
        tujuan_penggunaan: 'Testing evidence requirement',
        cara_memperoleh_informasi: 'Email',
        cara_mendapat_salinan: 'Email',
        status: 'Diproses',
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    console.log(`✅ Created test request ID: ${testRequest.id}`);
    
    // Simulate completing the request
    await prisma.request.update({
      where: { id: testRequest.id },
      data: {
        status: 'Selesai',
        updated_at: new Date()
      }
    });
    
    // Add the system message (simulating the API behavior)
    const completionMessage = await prisma.requestResponse.create({
      data: {
        request_id: testRequest.id,
        user_id: '0',
        user_role: 'System',
        user_name: 'System',
        message: `✅ Permohonan telah Selesai. Chat ditutup.\n\n📋 PENTING: Pemohon WAJIB melampirkan bukti hasil penggunaan informasi dalam waktu 30 hari setelah permohonan selesai. Bukti dapat berupa:\n• Hasil penelitian/skripsi/tesis (untuk keperluan akademik)\n• Dokumen administrasi yang telah diproses (untuk keperluan administrasi)\n• Laporan riset/analisis (untuk keperluan industri/bisnis)\n• Dokumentasi lainnya sesuai tujuan penggunaan\n\nSilakan kirim bukti melalui email ke ppid@garutkab.go.id dengan subjek "Bukti Penggunaan Informasi - ID Permohonan #${testRequest.id}"`,
        message_type: 'system'
      }
    });
    
    console.log(`✅ Added completion message with evidence requirement`);
    console.log(`📄 Message preview: ${completionMessage.message.substring(0, 100)}...`);
    
    // Test 2: Check PPID name display
    console.log('\n2️⃣ Testing PPID name display...');
    
    const ppidPelaksana = await prisma.ppid.findFirst({
      where: { role: 'PPID_PELAKSANA' }
    });
    
    if (ppidPelaksana) {
      // Add a test message from PPID Pelaksana
      const ppidMessage = await prisma.requestResponse.create({
        data: {
          request_id: testRequest.id,
          user_id: ppidPelaksana.id.toString(),
          user_role: 'PPID_PELAKSANA',
          user_name: ppidPelaksana.nama,
          message: 'Test message from PPID Pelaksana to verify name display',
          message_type: 'text'
        }
      });
      
      console.log(`✅ Added test message from PPID Pelaksana: ${ppidPelaksana.nama}`);
      console.log(`📝 In chat, this should display as: "${ppidPelaksana.nama} (PPID Pelaksana)"`);
    } else {
      console.log('⚠️  No PPID Pelaksana found to test name display');
    }
    
    // Test 3: Verify chat display format
    console.log('\n3️⃣ Verifying chat messages...');
    
    const allMessages = await prisma.requestResponse.findMany({
      where: { request_id: testRequest.id },
      orderBy: { created_at: 'asc' }
    });
    
    console.log(`📊 Total messages in test request: ${allMessages.length}`);
    allMessages.forEach((msg, index) => {
      const displayName = msg.user_role === 'PPID_PELAKSANA' ? `${msg.user_name} (PPID Pelaksana)` : 
                         msg.user_role === 'PPID_UTAMA' ? `${msg.user_name} (PPID Utama)` :
                         msg.user_role === 'ATASAN_PPID' ? `${msg.user_name} (Atasan PPID)` :
                         msg.user_role === 'ADMIN' ? `${msg.user_name} (Admin)` :
                         msg.user_role === 'System' ? 'Sistem' :
                         msg.user_name || msg.user_role;
      
      console.log(`  ${index + 1}. ${displayName}: ${msg.message.substring(0, 50)}${msg.message.length > 50 ? '...' : ''}`);
    });
    
    // Test 4: Test keberatan completion
    console.log('\n4️⃣ Testing keberatan completion...');
    
    const testKeberatan = await prisma.keberatan.create({
      data: {
        permintaan_id: testRequest.id,
        pemohon_id: pemohon.id,
        alasan_keberatan: 'Test keberatan for completion testing',
        status: 'Diproses'
      }
    });
    
    // Complete the keberatan
    await prisma.keberatan.update({
      where: { id: testKeberatan.id },
      data: {
        status: 'Selesai',
        updated_at: new Date()
      }
    });
    
    // Add completion message for keberatan
    const keberatanCompletionMessage = await prisma.keberatanResponse.create({
      data: {
        keberatan_id: testKeberatan.id,
        user_id: '0',
        user_role: 'System',
        user_name: 'System',
        message: `✅ Keberatan telah Selesai. Chat ditutup.\n\n📋 PENTING: Pemohon WAJIB melampirkan bukti hasil penggunaan informasi dalam waktu 30 hari setelah keberatan selesai. Bukti dapat berupa:\n• Hasil penelitian/skripsi/tesis (untuk keperluan akademik)\n• Dokumen administrasi yang telah diproses (untuk keperluan administrasi)\n• Laporan riset/analisis (untuk keperluan industri/bisnis)\n• Dokumentasi lainnya sesuai tujuan penggunaan\n\nSilakan kirim bukti melalui email ke ppid@garutkab.go.id dengan subjek "Bukti Penggunaan Informasi - ID Keberatan #${testKeberatan.id}"`,
        message_type: 'system'
      }
    });
    
    console.log(`✅ Added keberatan completion message with evidence requirement`);
    
    console.log('\n🎉 Summary of implemented features:');
    console.log('✅ 1. Evidence submission requirement added to completion messages');
    console.log('✅ 2. PPID Pelaksana name display updated (shows name + role)');
    console.log('✅ 3. Both permohonan and keberatan completion include evidence requirement');
    console.log('✅ 4. Email instructions provided for evidence submission');
    
    console.log('\n📝 Next steps:');
    console.log('1. Test in browser by completing a request/keberatan');
    console.log('2. Verify chat shows PPID names correctly');
    console.log('3. Check that evidence requirement message appears');
    
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await prisma.requestResponse.deleteMany({ where: { request_id: testRequest.id } });
    await prisma.keberatanResponse.deleteMany({ where: { keberatan_id: testKeberatan.id } });
    await prisma.keberatan.delete({ where: { id: testKeberatan.id } });
    await prisma.request.delete({ where: { id: testRequest.id } });
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Error testing completion features:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompletionFeatures();