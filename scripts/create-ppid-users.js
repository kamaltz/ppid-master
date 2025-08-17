const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createPpidUsers() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Creating PPID users...');
    
    // Simple hash for testing (use proper bcrypt in production)
    const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // 'password'
    
    // Create PPID Pelaksana users
    const ppidUsers = [
      {
        no_pegawai: 'PPID001',
        email: 'ppid.pelaksana1@garutkab.go.id',
        nama: 'Ahmad Pelaksana',
        role: 'PPID_PELAKSANA'
      },
      {
        no_pegawai: 'PPID002', 
        email: 'ppid.pelaksana2@garutkab.go.id',
        nama: 'Siti Pelaksana',
        role: 'PPID_PELAKSANA'
      },
      {
        no_pegawai: 'PPID003',
        email: 'ppid.pelaksana3@garutkab.go.id', 
        nama: 'Budi Pelaksana',
        role: 'PPID_PELAKSANA'
      }
    ];

    for (const user of ppidUsers) {
      // Check if user already exists
      const existing = await client.query('SELECT id FROM ppid WHERE email = $1', [user.email]);
      
      if (existing.rows.length === 0) {
        await client.query(`
          INSERT INTO ppid (no_pegawai, email, hashed_password, nama, role, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [user.no_pegawai, user.email, hashedPassword, user.nama, user.role]);
        
        console.log(`✅ Created: ${user.nama} (${user.email})`);
      } else {
        console.log(`⚠️ Already exists: ${user.nama} (${user.email})`);
      }
    }

    // Show all PPID users
    const allPpid = await client.query('SELECT id, nama, email, role FROM ppid ORDER BY role, nama');
    console.log('\n📋 All PPID Users:');
    allPpid.rows.forEach(user => {
      console.log(`- ${user.nama} (${user.role}) - ${user.email} [ID: ${user.id}]`);
    });
    
    console.log('\n🎉 PPID users setup completed!');
    console.log('\n🔑 Login credentials:');
    console.log('Email: ppid.pelaksana1@garutkab.go.id');
    console.log('Email: ppid.pelaksana2@garutkab.go.id'); 
    console.log('Email: ppid.pelaksana3@garutkab.go.id');
    console.log('Password: ppid123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createPpidUsers();