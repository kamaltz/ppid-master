# 🔧 Deployment Fix - Localhost URLs

## Masalah
Setelah deployment, aplikasi masih menggunakan `http://localhost:3000` untuk logo dan assets, menyebabkan:
- CSP violations
- 401 Unauthorized errors
- Assets tidak ter-load

## Solusi

### 1. Jalankan Fix Script di Production

```bash
# Masuk ke container (jika menggunakan Docker)
docker exec -it ppid-app sh

# Atau langsung di server
cd /path/to/ppid-master

# Jalankan fix script
npm run fix-localhost
```

### 2. Atau Manual via Database

Jika script tidak bisa dijalankan, update manual via SQL:

```sql
-- Connect to database
psql -U postgres -d ppid_garut

-- Check current settings
SELECT value FROM "Setting" LIMIT 1;

-- Update settings (replace localhost URLs)
UPDATE "Setting" 
SET value = jsonb_set(
  jsonb_set(
    value,
    '{general,logo}',
    to_jsonb(replace(value->'general'->>'logo', 'http://localhost:3000', ''))
  ),
  '{general,favicon}',
  to_jsonb(replace(value->'general'->>'favicon', 'http://localhost:3000', ''))
)
WHERE id = 1;
```

### 3. Clear Browser Cache

Setelah fix, clear cache browser:
- Chrome: Ctrl+Shift+Delete
- Firefox: Ctrl+Shift+Delete
- Safari: Cmd+Option+E

### 4. Restart Application

```bash
# Docker
docker-compose restart app

# PM2
pm2 restart ppid-app

# Systemd
systemctl restart ppid-app
```

## Pencegahan

Untuk mencegah masalah ini di masa depan:

1. **Jangan upload file dengan absolute URLs**
2. **Gunakan relative paths** untuk semua assets
3. **Jalankan `npm run fix-localhost`** sebelum deployment
4. **Set environment variable** di production:
   ```env
   NEXT_PUBLIC_API_URL=""
   ```

## Verifikasi

Setelah fix, cek:

1. ✅ Logo muncul di header
2. ✅ Favicon muncul di browser tab
3. ✅ Tidak ada CSP violations di console
4. ✅ Tidak ada 401 errors
5. ✅ Assets ter-load dengan benar

## Troubleshooting

### Logo masih tidak muncul
```bash
# Check database settings
npm run fix-localhost

# Clear Next.js cache
rm -rf .next
npm run build
```

### CSP violations masih ada
```bash
# Rebuild dengan CSP headers baru
npm run build
docker-compose restart
```

### 401 Unauthorized
```bash
# Check JWT_SECRET di environment
echo $JWT_SECRET

# Regenerate token
# Login ulang di aplikasi
```
