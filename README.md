# 🏛️ PPID Garut - Sistem Informasi Publik

**Aplikasi PPID (Pejabat Pengelola Informasi dan Dokumentasi) Kabupaten Garut** yang menggabungkan backend dan frontend dalam satu project Next.js untuk kemudahan konfigurasi dan deployment.

## ✨ Fitur Utama

### 🌐 **Frontend Public**
- **Hero Section Dinamis** - Carousel dengan auto-slide dan CTA customizable
- **Responsive Design** - Optimal di semua device (mobile, tablet, desktop)
- **SEO Optimized** - Meta tags dan structured data
- **Dynamic Content** - Konten dapat dikelola melalui admin panel

### 🔐 **Sistem Autentikasi**
- **Multi-Role System** - Admin, PPID Utama, PPID Pelaksana, Atasan PPID, Pemohon
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Akses menu berdasarkan role
- **Session Management** - Auto logout dan refresh token

### 📊 **Dashboard Admin**
- **Real-time Analytics** - Chart interaktif dengan berbagai tipe (pie, line, bar, donut)
- **Statistics Cards** - Ringkasan data permohonan
- **Responsive Layout** - Sidebar collapsible dan mobile-friendly
- **Data Export** - Export laporan dalam berbagai format

### 📝 **Manajemen Permohonan**
- **Form Permohonan** - Interface user-friendly untuk pemohon
- **Status Tracking** - Real-time status permohonan
- **File Upload** - Support multiple file formats
- **Workflow Management** - Alur persetujuan bertingkat

### ⚙️ **Pengaturan Website**
- **Dynamic Settings** - Logo, nama instansi, kontak dapat diubah
- **Menu Management** - Kelola menu header dengan dropdown
- **Hero Section Editor** - Upload gambar, edit teks, atur carousel
- **Footer Customization** - Social media links dan quick links

### 🖼️ **Media Management**
- **Image Upload** - Auto resize dan crop ke rasio optimal
- **File Storage** - Organized file structure
- **Image Optimization** - WebP conversion dan compression

## 🚀 Instalasi

### Prasyarat
- Node.js 18+ 
- npm atau yarn
- Database MySQL/PostgreSQL

### Langkah Instalasi

1. **Clone Repository**
```bash
git clone https://github.com/your-repo/ppid-garut.git
cd ppid-garut
```

2. **Install Dependencies**
```bash
npm install
# atau
yarn install
```

3. **Setup Environment Variables**
```bash
cp .env.local.example .env.local
```

4. **Konfigurasi Database**
Edit `.env.local` dan sesuaikan dengan konfigurasi database Anda:
```env
DATABASE_URL="mysql://username:password@localhost:3306/ppid_garut"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

5. **Setup Database**
```bash
# Migrate database
npm run db:migrate

# Seed initial data
npm run seed
```

6. **Jalankan Development Server**
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 👥 Akun Default (Seeder)

Setelah menjalankan `npm run seed`, akun berikut akan tersedia:

### 🔑 **Admin**
- **Email**: `admin@garutkab.go.id`
- **Password**: `admin123`
- **Role**: Administrator
- **Akses**: Full access ke semua fitur

### 🏛️ **PPID Utama**
- **Email**: `ppid@garutkab.go.id`
- **Password**: `ppid123`
- **Role**: PPID Utama
- **Akses**: Manajemen informasi, permohonan, keberatan

### 👨‍💼 **PPID Pelaksana**
- **Email**: `pelaksana@garutkab.go.id`
- **Password**: `pelaksana123`
- **Role**: PPID Pelaksana
- **Akses**: Proses permohonan, input informasi

### 👔 **Atasan PPID**
- **Email**: `atasan@garutkab.go.id`
- **Password**: `atasan123`
- **Role**: Atasan PPID
- **Akses**: Approve permohonan, monitoring

### 👤 **Pemohon Test**
- **Email**: `pemohon@example.com`
- **Password**: `pemohon123`
- **Role**: Pemohon
- **Akses**: Submit permohonan, tracking status

## 📖 Cara Penggunaan

### 🌐 **Akses Public**
1. Buka `http://localhost:3000`
2. Lihat informasi publik yang tersedia
3. Daftar akun baru atau login untuk mengajukan permohonan

### 🔐 **Login Admin**
1. Akses `http://localhost:3000/login`
2. Gunakan salah satu akun seeder di atas
3. Akan diarahkan ke dashboard sesuai role

### ⚙️ **Konfigurasi Website**
1. Login sebagai Admin
2. Masuk ke menu "Pengaturan"
3. Edit informasi umum, header, footer, dan hero section
4. Upload logo dan gambar hero
5. Simpan perubahan

### 📝 **Mengelola Permohonan**
1. Login sebagai PPID
2. Masuk ke menu "Permohonan"
3. Review permohonan masuk
4. Update status dan berikan tanggapan
5. Upload file jawaban jika diperlukan

## 🛠️ Scripts Available

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:migrate   # Run database migrations
npm run seed         # Seed initial data
npm run reset-admin  # Reset admin password

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run tests
```

## 🏗️ Struktur Project

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── admin/             # Admin pages
│   │   ├── pemohon/           # Pemohon dashboard
│   │   └── (public)/          # Public pages
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # UI components
│   ├── context/               # React contexts
│   ├── hooks/                 # Custom hooks
│   └── lib/                   # Utilities
├── lib/                       # Backend logic
│   ├── controllers/           # API controllers
│   ├── middleware/            # Middleware
│   ├── scripts/               # Database scripts
│   └── types/                 # TypeScript types
├── public/                    # Static assets
└── uploads/                   # User uploaded files
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Permohonan
- `GET /api/permohonan` - Get permohonan list
- `POST /api/permohonan` - Create new permohonan
- `PUT /api/permohonan/[id]` - Update permohonan
- `DELETE /api/permohonan/[id]` - Delete permohonan

### Informasi
- `GET /api/informasi` - Get public information
- `POST /api/informasi` - Create information (PPID only)
- `PUT /api/informasi/[id]` - Update information

### Settings
- `GET /api/settings` - Get website settings
- `POST /api/settings` - Update settings (Admin only)

### Upload
- `POST /api/upload/image` - Upload image files
- `POST /api/upload/document` - Upload document files

## 🌟 Keunggulan

- ✅ **Single Deployment** - Frontend dan backend dalam satu aplikasi
- ✅ **Responsive Design** - Optimal di semua device
- ✅ **Role-Based Access** - Keamanan berlapis
- ✅ **Real-time Updates** - Data selalu up-to-date
- ✅ **SEO Friendly** - Optimized untuk search engine
- ✅ **Easy Customization** - Interface admin untuk kustomisasi
- ✅ **File Management** - Upload dan manajemen file terintegrasi
- ✅ **Analytics Dashboard** - Monitoring dan reporting

## 📞 Support

Untuk bantuan teknis atau pertanyaan:
- Email: support@garutkab.go.id
- Documentation: [Link to docs]
- Issues: [GitHub Issues]

---

**Dikembangkan untuk PPID Diskominfo Kabupaten Garut** 🏛️