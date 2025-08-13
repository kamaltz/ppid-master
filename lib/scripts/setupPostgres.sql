-- Setup PostgreSQL Database for PPID Garut
-- Run this in your local PostgreSQL

-- Create database
CREATE DATABASE ppid_garut;

-- Connect to the database
\c ppid_garut;

-- Create requests table (simple, no foreign keys)
CREATE TABLE requests (
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
);

-- Create pemohon table
CREATE TABLE pemohon (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    nama VARCHAR(255) NOT NULL,
    no_telepon VARCHAR(20),
    alamat TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert test user
INSERT INTO pemohon (id, email, hashed_password, nama, no_telepon, alamat) VALUES
(12, 'test@example.com', '$2a$10$lTd.FV9vtei1mOGypy2vCeQH8bGFZEs7JpwJceBimpdP9wXEHd0z6', 'Test User', '081234567890', 'Test Address');

-- Test insert
INSERT INTO requests (pemohon_id, rincian_informasi, tujuan_penggunaan) VALUES
(12, 'Test request', 'Testing purpose');