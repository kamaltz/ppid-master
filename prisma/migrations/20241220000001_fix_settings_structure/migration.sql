-- Fix settings structure migration
-- This migration ensures proper settings data structure

-- First, let's check if we have any settings data and fix it
DO $$
BEGIN
    -- Update or insert general settings with proper structure
    INSERT INTO "Setting" (key, value) 
    VALUES (
        'general',
        '{"namaInstansi":"PPID Diskominfo Kabupaten Garut","logo":"/logo-garut.svg","email":"ppid@garutkab.go.id","telepon":"(0262) 123456","alamat":"Jl. Pembangunan No. 1, Garut, Jawa Barat","websiteTitle":"PPID Diskominfo Kabupaten Garut - Layanan Informasi Publik","websiteDescription":"Pejabat Pengelola Informasi dan Dokumentasi (PPID) Dinas Komunikasi dan Informatika Kabupaten Garut. Layanan informasi publik yang transparan, akuntabel, dan mudah diakses sesuai UU No. 14 Tahun 2008."}'
    )
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value
    WHERE "Setting".value = '{"site_name":"Test"}' OR "Setting".value LIKE '%"site_name"%';

    -- Update or insert header settings with proper menu structure
    INSERT INTO "Setting" (key, value)
    VALUES (
        'header',
        '{"menuItems":[{"label":"Beranda","url":"/","hasDropdown":false,"dropdownItems":[]},{"label":"Profil","url":"/profil","hasDropdown":true,"dropdownItems":[{"label":"Tentang PPID","url":"/profil"},{"label":"Visi Misi","url":"/visi-misi"},{"label":"Struktur Organisasi","url":"/struktur"}]},{"label":"Informasi Publik","url":"/informasi","hasDropdown":false,"dropdownItems":[]},{"label":"Layanan","url":"/layanan","hasDropdown":true,"dropdownItems":[{"label":"Permohonan Informasi","url":"/permohonan"},{"label":"Keberatan","url":"/keberatan"}]}]}'
    )
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value
    WHERE "Setting".value = '{"logo":"/new-logo.png"}' OR "Setting".value NOT LIKE '%"menuItems"%';

    -- Ensure footer settings exist with proper structure
    INSERT INTO "Setting" (key, value)
    VALUES (
        'footer',
        '{"companyName":"PPID Kabupaten Garut","description":"PPID Diskominfo Kabupaten Garut berkomitmen untuk memberikan pelayanan informasi publik yang transparan dan akuntabel.","address":"Jl. Pembangunan No. 1, Garut, Jawa Barat","phone":"(0262) 123456","email":"ppid@garutkab.go.id","socialMedia":{"facebook":"","twitter":"","instagram":"","youtube":""},"quickLinks":[{"label":"Beranda","url":"/"},{"label":"Profil PPID","url":"/profil"},{"label":"DIP","url":"/dip"},{"label":"Kontak","url":"/kontak"}],"copyrightText":"PPID Kabupaten Garut. Semua hak dilindungi.","showAddress":true,"showContact":true,"showSocialMedia":true}'
    )
    ON CONFLICT (key) DO NOTHING;

    -- Ensure hero settings exist with proper structure
    INSERT INTO "Setting" (key, value)
    VALUES (
        'hero',
        '{"title":"Selamat Datang di PPID Kabupaten Garut","subtitle":"Pejabat Pengelola Informasi dan Dokumentasi","description":"Kami berkomitmen untuk memberikan akses informasi publik yang transparan, akuntabel, dan mudah diakses oleh seluruh masyarakat.","backgroundImage":"","ctaText":"Ajukan Permohonan","ctaUrl":"/permohonan","isCarousel":false,"autoSlide":true,"slideInterval":4000,"slides":[]}'
    )
    ON CONFLICT (key) DO NOTHING;

END $$;