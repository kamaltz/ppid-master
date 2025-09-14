# 🔧 Fix Database Migration Issue

Ada masalah dengan migrasi `20241220000001_fix_settings_structure` yang gagal karena tabel `settings` tidak ada. Berikut cara memperbaikinya:

## Metode 1: Menggunakan Script SQL (Tercepat)

1. **Jalankan script SQL untuk reset database:**
```bash
psql -h localhost -U postgres -d ppid_db -f fix-db.sql
```

2. **Hapus migrasi bermasalah:**
```bash
rm -rf prisma/migrations/20241220000001_fix_settings_structure
```

3. **Deploy migrasi ulang:**
```bash
npx prisma migrate deploy
```

4. **Generate Prisma client:**
```bash
npx prisma generate
```

5. **Jalankan seed:**
```bash
npm run seed
```

## Metode 2: Menggunakan Script Bash

```bash
chmod +x fix-production-db.sh
./fix-production-db.sh
```

## Metode 3: Manual Step by Step

1. **Masuk ke PostgreSQL:**
```bash
psql -h localhost -U postgres -d ppid_db
```

2. **Drop semua tabel:**
```sql
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;
```

3. **Drop migration history:**
```sql
DROP TABLE IF EXISTS _prisma_migrations CASCADE;
\q
```

4. **Hapus migrasi bermasalah:**
```bash
rm -rf prisma/migrations/20241220000001_fix_settings_structure
```

5. **Deploy migrasi:**
```bash
npx prisma migrate deploy
npx prisma generate
npm run seed
```

## Verifikasi

Setelah selesai, cek apakah aplikasi berjalan:
```bash
npm run build
npm start
```

Buka browser dan akses aplikasi untuk memastikan semuanya bekerja dengan baik.

## Akun Default Setelah Seed

- **Admin:** admin@garutkab.go.id / Garut@2025?
- **PPID Utama:** ppid.utama@garutkab.go.id / Garut@2025?
- **PPID Pelaksana:** ppid.pelaksana@garutkab.go.id / Garut@2025?
- **Pemohon:** pemohon@example.com / Garut@2025?

## Fitur Notifikasi yang Diperbaiki

Setelah database diperbaiki, sistem notifikasi akan bekerja dengan baik:

- ✅ **Admin & PPID Utama** akan melihat notifikasi merah di sidebar untuk:
  - Permohonan baru (status "Diajukan")
  - Keberatan baru (status "Diajukan") 
  - Akun pemohon yang perlu diapprove
  - Chat baru dari pemohon

- ✅ **PPID Pelaksana** akan melihat notifikasi untuk:
  - Permohonan yang diteruskan ke mereka
  - Chat baru dari pemohon

- ✅ **Pemohon** akan melihat notifikasi untuk:
  - Balasan chat dari PPID/Admin

Notifikasi akan refresh otomatis setiap 30 detik.