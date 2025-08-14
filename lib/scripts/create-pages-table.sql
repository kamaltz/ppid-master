-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_pages_status ON pages(status);

-- Insert default pages
INSERT INTO pages (title, slug, content, status) VALUES 
('Profil PPID', 'profil', '<h2>Profil PPID Diskominfo Garut</h2><p>Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut adalah unit kerja yang bertanggung jawab dalam pengelolaan dan pelayanan informasi publik di lingkungan Pemerintah Kabupaten Garut.</p><h3>Visi</h3><p>Mewujudkan pelayanan informasi publik yang transparan, akuntabel, dan berkualitas untuk mendukung tata kelola pemerintahan yang baik.</p><h3>Misi</h3><ul><li>Menyelenggarakan pelayanan informasi publik yang cepat, tepat, dan mudah diakses</li><li>Meningkatkan kualitas pengelolaan informasi dan dokumentasi</li><li>Membangun sistem informasi yang terintegrasi dan terpercaya</li><li>Mendorong partisipasi masyarakat dalam pengawasan penyelenggaraan pemerintahan</li></ul><h3>Tugas dan Fungsi</h3><p>PPID memiliki tugas pokok melaksanakan pengumpulan, pengolahan, penyimpanan, pendokumentasian, penyediaan, dan pelayanan informasi publik sesuai dengan ketentuan peraturan perundang-undangan.</p>', 'published'),
('Daftar Informasi Publik (DIP)', 'dip', '<h2>Daftar Informasi Publik</h2><p>Daftar Informasi Publik (DIP) adalah katalog yang berisi informasi yang wajib disediakan dan diumumkan secara berkala, informasi yang wajib diumumkan serta merta, dan informasi yang wajib tersedia setiap saat.</p><h3>Informasi Berkala</h3><ul><li>Laporan Keuangan Daerah</li><li>Laporan Kinerja Instansi Pemerintah (LAKIP)</li><li>Rencana Strategis (Renstra)</li><li>Rencana Kerja Tahunan</li><li>Laporan Penyelenggaraan Pemerintahan Daerah (LPPD)</li></ul><h3>Informasi Serta Merta</h3><ul><li>Informasi yang dapat mengancam hajat hidup orang banyak</li><li>Informasi keadaan darurat</li><li>Informasi keselamatan dan keamanan publik</li><li>Informasi yang berkaitan dengan bencana alam</li></ul><h3>Informasi Setiap Saat</h3><ul><li>Struktur Organisasi</li><li>Profil Pejabat</li><li>Peraturan Daerah dan Peraturan Bupati</li><li>Data Statistik Daerah</li><li>Prosedur Pelayanan Publik</li><li>Tarif Pelayanan</li></ul><h3>Informasi Dikecualikan</h3><p>Informasi yang dikecualikan sesuai dengan ketentuan peraturan perundang-undangan meliputi informasi yang dapat menghambat proses penegakan hukum, mengganggu kepentingan perlindungan hak atas kekayaan intelektual, dan membahayakan pertahanan dan keamanan negara.</p>', 'published')
ON CONFLICT (slug) DO NOTHING;