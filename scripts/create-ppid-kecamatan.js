const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createPpidKecamatan() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating PPID Pelaksana for 32 Kecamatan...');
    
    // Simple hash for testing (use proper bcrypt in production)
    const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'
    
    const kecamatanList = [
      'Garut Kota', 'Karangpawitan', 'Wanaraja', 'Tarogong Kaler', 'Tarogong Kidul',
      'Banyuresmi', 'Samarang', 'Leles', 'Kadungora', 'Leuwigoong',
      'Cibatu', 'Kersamanah', 'Malangbong', 'Sukawening', 'Karangtengah',
      'Bayongbong', 'Cigedug', 'Cilawu', 'Cisurupan', 'Sukaresmi',
      'Cikajang', 'Banjarwangi', 'Singajaya', 'Cihurip', 'Peundeuy',
      'Cisompet', 'Cibalong', 'Cikelet', 'Bungbulang', 'Mekarmukti',
      'Pamulihan', 'Pakenjeng'
    ];

    const ppidUsers = [];
    for (let i = 0; i < kecamatanList.length; i++) {
      const kecamatan = kecamatanList[i];
      const kecamatanCode = kecamatan.toLowerCase().replace(/\s+/g, '');
      
      ppidUsers.push({
        no_pegawai: `PPID${(i + 1).toString().padStart(3, '0')}`,
        email: `ppid.${kecamatanCode}@garutkab.go.id`,
        nama: `PPID Kecamatan ${kecamatan}`,
        role: 'PPID_PELAKSANA'
      });
    }

    let created = 0;
    let existing = 0;

    for (const user of ppidUsers) {
      // Check if user already exists by email or no_pegawai
      const existingUser = await client.query('SELECT id FROM ppid WHERE email = $1 OR no_pegawai = $2', [user.email, user.no_pegawai]);
      
      if (existingUser.rows.length === 0) {
        await client.query(`
          INSERT INTO ppid (no_pegawai, email, hashed_password, nama, role, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [user.no_pegawai, user.email, hashedPassword, user.nama, user.role]);
        
        created++;
        console.log(`✅ Created: ${user.nama} (${user.email})`);
      } else {
        existing++;
        console.log(`⚠️ Already exists: ${user.nama} (${user.email})`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`- Created: ${created} accounts`);
    console.log(`- Already existed: ${existing} accounts`);
    console.log(`- Total: ${created + existing} accounts`);
    
    console.log('\n🔑 Login credentials:');
    console.log('Email: ppid.garutkota@garutkab.go.id, ppid.karangpawitan@garutkab.go.id, etc.');
    console.log('Password: password');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createPpidKecamatan();