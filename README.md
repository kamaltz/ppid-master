# 🏛️ PPID Master - Sistem Informasi Publik

**Aplikasi PPID (Pejabat Pengelola Informasi dan Dokumentasi) Kabupaten Garut** yang menggabungkan backend dan frontend dalam satu project Next.js dengan database PostgreSQL dan Prisma ORM untuk kemudahan konfigurasi dan deployment.

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
- **Chat System** - Real-time communication antara pemohon dan PPID

### 🚨 **Manajemen Keberatan**

- **Form Keberatan** - Pengajuan keberatan atas permohonan
- **Multi-level Review** - Alur review bertingkat
- **Response System** - Chat dan file attachment untuk keberatan
- **Status Tracking** - Monitoring progress keberatan

### ⚙️ **Pengaturan Website**

- **Dynamic Settings** - Logo, nama instansi, kontak dapat diubah
- **Menu Management** - Kelola menu header dengan dropdown
- **Hero Section Editor** - Upload gambar, edit teks, atur carousel
- **Footer Customization** - Social media links dan quick links

### 🖼️ **Media Management**

- **Image Upload** - Auto resize dan crop ke rasio optimal
- **File Storage** - Organized file structure
- **Image Optimization** - WebP conversion dan compression

### 👥 **Account Management**

- **Multi-role User Management** - Admin, PPID, Pemohon
- **Bulk Import** - Import users dari CSV/Excel
- **Password Reset** - Reset password untuk semua role
- **Activity Logging** - Log semua aktivitas user

## 🚀 Instalasi

### Prasyarat

- Node.js 18+
- npm atau yarn
- PostgreSQL 14+
- Git

### Langkah Instalasi

1. **Clone Repository**

```bash
git clone https://github.com/your-repo/ppid-master.git
cd ppid-master
```

2. **Install Dependencies**

```bash
npm install
# atau
yarn install
```

3. **Setup Environment Variables**

```bash
cp .env.example .env.local
```

4. **Konfigurasi Database**
   Edit `.env.local` dan sesuaikan dengan konfigurasi database PostgreSQL Anda:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ppid_garut?schema=public"
JWT_SECRET="your-jwt-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

5. **Setup Database**

```bash
# Generate Prisma client
npx prisma generate

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

- **Email**: `admin@garut.go.id`
- **Password**: `Garut@2025?`
- **Role**: Administrator
- **Akses**: Full access ke semua fitur

### 🏛️ **PPID Utama**

- **Email**: `ppid.utama@garut.go.id`
- **Password**: `Garut@2025?`
- **Role**: PPID Utama
- **Akses**: Manajemen informasi, permohonan, keberatan

### 👨💼 **PPID Pelaksana**

- **Email**: `ppid.pelaksana@garut.go.id`
- **Password**: `Garut@2025?`
- **Role**: PPID Pelaksana
- **Akses**: Proses permohonan, input informasi

### 👔 **Atasan PPID**

- **Email**: `atasan.ppid@garut.go.id`
- **Password**: `Garut@2025?`
- **Role**: Atasan PPID
- **Akses**: Approve permohonan, monitoring

### 👤 **Pemohon Test**

- **Email**: `pemohon@example.com`
- **Password**: `Garut@2025?`
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

# Testing
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:auth    # Run authentication tests
npm run test:admin   # Run admin tests
npm run test:requests # Run request tests

# Code Quality
npm run lint         # Run ESLint
```

## 🏗️ Struktur Project

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── admin/         # Admin management endpoints
│   │   │   ├── permintaan/    # Request management endpoints
│   │   │   ├── keberatan/     # Objection management endpoints
│   │   │   ├── informasi/     # Information management endpoints
│   │   │   ├── accounts/      # Account management endpoints
│   │   │   ├── chat/          # Chat system endpoints
│   │   │   └── upload/        # File upload endpoints
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── dashboard/         # User dashboard pages
│   │   ├── pemohon/           # Pemohon dashboard
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── [slug]/            # Dynamic pages
│   ├── components/            # React components
│   │   ├── auth/              # Authentication components
│   │   ├── layout/            # Layout components
│   │   ├── ui/                # UI components
│   │   └── accessibility/     # Accessibility components
│   ├── context/               # React contexts
│   ├── hooks/                 # Custom hooks
│   └── lib/                   # Frontend utilities
├── lib/                       # Backend logic
│   ├── controllers/           # API controllers
│   ├── middleware/            # Authentication middleware
│   ├── scripts/               # Database scripts & seeders
│   ├── frontend/              # Frontend utilities
│   └── types/                 # TypeScript types
├── prisma/                    # Database schema & migrations
│   ├── migrations/            # Database migrations
│   └── schema.prisma          # Prisma schema
├── scripts/                   # Utility scripts
├── public/                    # Static assets
│   └── uploads/               # User uploaded files
└── __tests__/                 # Test files
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Permohonan/Permintaan

- `GET /api/permintaan` - Get request list
- `POST /api/permintaan` - Create new request
- `GET /api/permintaan/[id]` - Get request detail
- `PUT /api/permintaan/[id]` - Update request
- `DELETE /api/permintaan/[id]` - Delete request
- `POST /api/permintaan/[id]/responses` - Add response to request

### Keberatan

- `GET /api/keberatan` - Get objection list
- `POST /api/keberatan` - Create new objection
- `GET /api/keberatan/[id]` - Get objection detail
- `PUT /api/keberatan/[id]` - Update objection
- `POST /api/keberatan/[id]/responses` - Add response to objection

### Informasi Publik

- `GET /api/informasi` - Get public information list
- `POST /api/informasi` - Create information (PPID only)
- `GET /api/informasi/[id]` - Get information detail
- `PUT /api/informasi/[id]` - Update information
- `DELETE /api/informasi/[id]` - Delete information

### Admin Management

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get users list
- `POST /api/admin/assign-ppid` - Assign PPID to request
- `GET /api/admin/activity-logs` - Get activity logs
- `GET /api/admin/role-stats` - Get role statistics

### Accounts Management

- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/[id]` - Get account detail
- `PUT /api/accounts/[id]` - Update account
- `DELETE /api/accounts/delete` - Delete account
- `POST /api/accounts/reset-password` - Reset password

### Categories

- `GET /api/kategori` - Get categories
- `POST /api/kategori` - Create category
- `PUT /api/kategori/[id]` - Update category
- `DELETE /api/kategori/[id]` - Delete category

### Pages Management

- `GET /api/pages` - Get pages
- `POST /api/pages` - Create page
- `GET /api/pages/[id]` - Get page detail
- `PUT /api/pages/[id]` - Update page
- `DELETE /api/pages/[id]` - Delete page

### Settings

- `GET /api/settings` - Get website settings
- `POST /api/settings` - Update settings (Admin only)

### Upload & Media

- `POST /api/upload` - Upload files
- `POST /api/upload/image` - Upload image files
- `GET /api/admin/media` - Get media files

### Chat & Communication

- `GET /api/chat/[requestId]` - Get chat messages
- `POST /api/chat/[requestId]` - Send chat message
- `POST /api/chat/[requestId]/end` - End chat session
- `GET /api/ppid-chat` - Get PPID internal chat
- `POST /api/ppid-chat` - Send PPID internal message

### Statistics & Reports

- `GET /api/stats/public` - Get public statistics
- `GET /api/laporan` - Generate reports

## 🗄️ Database Schema

Aplikasi menggunakan PostgreSQL dengan Prisma ORM. Schema utama:

- **Admin** - Administrator sistem
- **Pemohon** - Pengguna yang mengajukan permohonan
- **Ppid** - Petugas PPID (Utama, Pelaksana, Atasan)
- **Request** - Permohonan informasi publik
- **Keberatan** - Keberatan atas permohonan
- **InformasiPublik** - Informasi publik yang dipublikasikan
- **RequestResponse** - Chat/respon untuk permohonan
- **KeberatanResponse** - Chat/respon untuk keberatan
- **ActivityLog** - Log aktivitas sistem
- **Setting** - Pengaturan website
- **Page** - Halaman dinamis
- **Kategori** - Kategori informasi

## 🧪 Testing

Aplikasi dilengkapi dengan comprehensive test suite:

```bash
# Run specific test suites
npm run test:auth          # Authentication tests
npm run test:admin         # Admin functionality tests
npm run test:requests      # Request management tests
npm run test:information   # Information management tests
npm run test:objections    # Objection management tests
npm run test:categories    # Category management tests
npm run test:uploads       # File upload tests
npm run test:settings      # Settings management tests
npm run test:integration   # Integration tests
npm run test:utils         # Utility function tests
```

## 🔧 Development Tools

- **Prisma Studio** - Database GUI: `npx prisma studio`
- **Database Reset** - Reset & reseed: `npx prisma migrate reset`
- **Schema Sync** - Sync schema: `npx prisma db push`
- **Generate Client** - Update Prisma client: `npx prisma generate`

## 🌟 Keunggulan

- ✅ **Single Deployment** - Frontend dan backend dalam satu aplikasi
- ✅ **Responsive Design** - Optimal di semua device
- ✅ **Role-Based Access** - Keamanan berlapis
- ✅ **Real-time Updates** - Data selalu up-to-date
- ✅ **SEO Friendly** - Optimized untuk search engine
- ✅ **Easy Customization** - Interface admin untuk kustomisasi
- ✅ **File Management** - Upload dan manajemen file terintegrasi
- ✅ **Analytics Dashboard** - Monitoring dan reporting
- ✅ **Chat System** - Real-time communication
- ✅ **Comprehensive Testing** - Full test coverage
- ✅ **PostgreSQL + Prisma** - Modern database stack

**Dikembangkan untuk PPID Diskominfo Kabupaten Garut** 🏛️
