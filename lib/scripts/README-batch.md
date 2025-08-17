# Batch Script untuk Menambah Data Informasi

## Script: batch-informasi-2020-2025.js

Script ini akan menambahkan data informasi publik dari tahun 2020 hingga 2025 untuk testing urutan tampilan di homepage.

### Fitur:
- Membuat 12 informasi per tahun (1 per bulan) dari 2020-2025
- Total 72 record informasi
- Tanggal posting acak dalam setiap bulan
- Kategori acak (informasi-berkala, informasi-serta-merta, informasi-setiap-saat)
- Data diurutkan berdasarkan tanggal terbaru

### Cara Menjalankan:

```bash
# Menggunakan npm script
npm run batch:informasi

# Atau langsung dengan node
node lib/scripts/batch-informasi-2020-2025.js
```

### Output:
- Script akan menampilkan progress penambahan data
- Menampilkan total record yang berhasil ditambahkan
- Menampilkan total record informasi di database

### Tujuan:
Script ini dibuat untuk testing urutan informasi di homepage berdasarkan tanggal posting terbaru.