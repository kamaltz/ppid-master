-- Add old test requests for keberatan testing
-- Use existing user camvr35@gmail.com

INSERT INTO requests (
  pemohon_id,
  judul, rincian_informasi, tujuan_penggunaan, 
  cara_memperoleh_informasi, cara_mendapat_salinan, status,
  created_at, updated_at
) VALUES 
-- Request 1: 35 days ago (eligible)
(
  (SELECT id FROM pemohon WHERE email = 'camvr35@gmail.com'),
  'Permohonan Data Kependudukan 2024',
  'Meminta data statistik kependudukan Kabupaten Garut tahun 2024 untuk keperluan penelitian',
  'Penelitian akademik', 'Email', 'Email', 'Diproses',
  NOW() - INTERVAL '35 days', NOW() - INTERVAL '35 days'
),
-- Request 2: 28 days ago (eligible)
(
  (SELECT id FROM pemohon WHERE email = 'camvr35@gmail.com'),
  'Permohonan Anggaran APBD Pendidikan',
  'Meminta informasi rincian anggaran APBD sektor pendidikan tahun 2024',
  'Transparansi publik', 'Email', 'Email', 'Diproses',
  NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days'
),
-- Request 3: 25 days ago (eligible)
(
  (SELECT id FROM pemohon WHERE email = 'camvr35@gmail.com'),
  'Permohonan Data Infrastruktur Jalan',
  'Meminta data pembangunan infrastruktur jalan kabupaten tahun 2023-2024',
  'Monitoring pembangunan', 'Email', 'Email', 'Diproses',
  NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'
),
-- Request 4: 10 days ago (not eligible yet)
(
  (SELECT id FROM pemohon WHERE email = 'camvr35@gmail.com'),
  'Permohonan Data Pendidikan Terbaru',
  'Meminta data sekolah dan siswa di Kabupaten Garut tahun 2024',
  'Analisis pendidikan', 'Email', 'Email', 'Diproses',
  NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
),
-- Request 5: 5 days ago (not eligible yet)
(
  (SELECT id FROM pemohon WHERE email = 'camvr35@gmail.com'),
  'Permohonan Data Kesehatan',
  'Meminta data fasilitas kesehatan dan tenaga medis di Kabupaten Garut',
  'Evaluasi kesehatan', 'Email', 'Email', 'Diproses',
  NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
);