const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function resetAndSeedRequests() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️ Clearing existing data...');
    
    // Delete existing data
    await client.query('DELETE FROM keberatan_responses');
    await client.query('DELETE FROM request_responses');
    await client.query('DELETE FROM keberatan');
    await client.query('DELETE FROM requests');
    
    console.log('✅ Data cleared');
    console.log('📝 Creating sample requests...');
    
    // Sample requests data
    const requests = [
      {
        pemohon_id: 1,
        judul: 'Informasi Anggaran Desa 2024',
        rincian_informasi: 'Meminta informasi detail penggunaan anggaran desa tahun 2024 termasuk alokasi untuk pembangunan infrastruktur',
        tujuan_penggunaan: 'Untuk transparansi dan pengawasan masyarakat terhadap penggunaan dana desa',
        status: 'Diajukan'
      },
      {
        pemohon_id: 1,
        judul: 'Data Penerima Bantuan Sosial',
        rincian_informasi: 'Daftar nama penerima bantuan sosial COVID-19 di wilayah Garut beserta kriteria penerima',
        tujuan_penggunaan: 'Verifikasi data untuk penelitian akademik tentang efektivitas bantuan sosial',
        status: 'Diajukan'
      },
      {
        pemohon_id: 1,
        judul: 'Rencana Tata Ruang Wilayah',
        rincian_informasi: 'Dokumen RTRW Kabupaten Garut 2021-2041 dan peta zonasi terbaru',
        tujuan_penggunaan: 'Analisis untuk proposal investasi dan pengembangan usaha',
        status: 'Diajukan'
      },
      {
        pemohon_id: 1,
        judul: 'Laporan Keuangan APBD',
        rincian_informasi: 'Laporan realisasi APBD Kabupaten Garut tahun 2023 lengkap dengan rincian per bidang',
        tujuan_penggunaan: 'Bahan kajian untuk organisasi masyarakat sipil',
        status: 'Diajukan'
      },
      {
        pemohon_id: 1,
        judul: 'Data Perizinan Usaha',
        rincian_informasi: 'Informasi jumlah dan jenis perizinan usaha yang dikeluarkan tahun 2024',
        tujuan_penggunaan: 'Analisis iklim investasi untuk laporan media',
        status: 'Diajukan'
      }
    ];

    // Insert requests and get IDs
    const requestIds = [];
    for (const req of requests) {
      const result = await client.query(`
        INSERT INTO requests (pemohon_id, judul, rincian_informasi, tujuan_penggunaan, status, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `, [req.pemohon_id, req.judul, req.rincian_informasi, req.tujuan_penggunaan, req.status]);
      requestIds.push(result.rows[0].id);
    }

    console.log('✅ Sample requests created');
    console.log('📝 Creating sample keberatan...');

    // Sample keberatan data using actual request IDs
    const keberatan = [
      {
        permintaan_id: requestIds[0],
        pemohon_id: 1,
        judul: 'Keberatan atas Penolakan Informasi Anggaran',
        alasan_keberatan: 'Permohonan informasi anggaran desa ditolak tanpa alasan yang jelas. Padahal informasi ini merupakan hak publik sesuai UU KIP.',
        status: 'Diajukan'
      },
      {
        permintaan_id: requestIds[1],
        pemohon_id: 1,
        judul: 'Keberatan Lambatnya Respon',
        alasan_keberatan: 'Sudah 20 hari tidak ada tanggapan atas permohonan informasi bantuan sosial. Ini melanggar batas waktu yang ditetapkan.',
        status: 'Diajukan'
      },
      {
        permintaan_id: requestIds[2],
        pemohon_id: 1,
        judul: 'Keberatan Informasi Tidak Lengkap',
        alasan_keberatan: 'Informasi RTRW yang diberikan tidak lengkap, hanya berupa ringkasan tanpa detail peta zonasi yang diminta.',
        status: 'Diajukan'
      }
    ];

    // Insert keberatan
    for (const keb of keberatan) {
      await client.query(`
        INSERT INTO keberatan (permintaan_id, pemohon_id, judul, alasan_keberatan, status, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [keb.permintaan_id, keb.pemohon_id, keb.judul, keb.alasan_keberatan, keb.status]);
    }

    console.log('✅ Sample keberatan created');
    
    // Show summary
    const requestCount = await client.query('SELECT COUNT(*) FROM requests');
    const keberatanCount = await client.query('SELECT COUNT(*) FROM keberatan');
    
    console.log('\n📊 Summary:');
    console.log(`- Requests: ${requestCount.rows[0].count}`);
    console.log(`- Keberatan: ${keberatanCount.rows[0].count}`);
    console.log('\n🎉 Data seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

resetAndSeedRequests();