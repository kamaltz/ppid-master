require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'ppid_garut',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function seedDatabase() {
  try {
    console.log('🌱 Seeding PostgreSQL database...');

    // Hash passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const pemohonHash = await bcrypt.hash('pemohon123', 10);
    const ppidHash = await bcrypt.hash('ppid123', 10);

    // Clear existing data
    await pool.query('TRUNCATE TABLE requests, pemohon, admin, ppid RESTART IDENTITY CASCADE');
    console.log('✅ Cleared existing data');

    // Create tables if not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        nama VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pemohon (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        nama VARCHAR(255) NOT NULL,
        no_telepon VARCHAR(20),
        alamat TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ppid (
        id SERIAL PRIMARY KEY,
        no_pegawai VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        nama VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'PPID',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        pemohon_id INTEGER NOT NULL,
        rincian_informasi TEXT NOT NULL,
        tujuan_penggunaan TEXT NOT NULL,
        cara_memperoleh_informasi VARCHAR(100) DEFAULT 'Email',
        cara_mendapat_salinan VARCHAR(100) DEFAULT 'Email',
        status VARCHAR(50) DEFAULT 'Diajukan',
        catatan_ppid TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insert admin
    await pool.query(
      'INSERT INTO admin (email, hashed_password, nama) VALUES ($1, $2, $3)',
      ['admin@ppid-garut.go.id', adminHash, 'Administrator PPID']
    );

    // Insert pemohon
    await pool.query(
      'INSERT INTO pemohon (email, hashed_password, nama, no_telepon, alamat) VALUES ($1, $2, $3, $4, $5)',
      ['pemohon1@example.com', pemohonHash, 'Ahmad Rizki', '081234567890', 'Jl. Contoh No. 1']
    );

    // Insert PPID
    await pool.query(
      'INSERT INTO ppid (no_pegawai, email, hashed_password, nama, role) VALUES ($1, $2, $3, $4, $5)',
      ['PPID001', 'ppid@ppid-garut.go.id', ppidHash, 'PPID Utama', 'PPID']
    );

    // Insert sample request
    await pool.query(
      'INSERT INTO requests (pemohon_id, rincian_informasi, tujuan_penggunaan) VALUES ($1, $2, $3)',
      [1, 'Sample request information', 'Testing purpose']
    );

    console.log('✅ Database seeded successfully!');
    console.log('\n🔑 Login credentials:');
    console.log('Admin: admin@ppid-garut.go.id / admin123');
    console.log('Pemohon: pemohon1@example.com / pemohon123');
    console.log('PPID: ppid@ppid-garut.go.id / ppid123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase();