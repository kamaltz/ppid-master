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
- **Assignment System** - Otomatis assign ke PPID Pelaksana
- **Role-based Visibility** - Chat muncul sesuai role dan assignment

### 🚨 **Manajemen Keberatan**

- **Form Keberatan** - Pengajuan keberatan atas permohonan
- **Multi-level Review** - Alur review bertingkat
- **Response System** - Chat dan file attachment untuk keberatan
- **Status Tracking** - Monitoring progress keberatan
- **17-Day Rule** - Validasi hari kerja untuk pengajuan keberatan

### 💬 **Sistem Chat Terintegrasi**

- **Real-time Communication** - Chat langsung antara pemohon dan PPID
- **Multi-role Chat** - Pemohon, PPID Utama, PPID Pelaksana, Atasan PPID
- **Auto-display Chats** - Otomatis tampilkan chat dari permohonan/keberatan
- **File Attachments** - Upload dokumen dan gambar dalam chat
- **Chat Management** - Bulk delete, end chat, resume chat
- **Assignment Transfer** - Chat pindah saat diteruskan ke PPID lain
- **Notification System** - Badge notifikasi untuk chat baru
- **Cross-tab Sync** - Sinkronisasi real-time antar tab browser

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
- **Auto-approval System** - Persetujuan akun pemohon otomatis

### 🎯 **Enhanced User Experience**

- **Auto-redirect** - Langsung ke chat setelah buat permohonan/keberatan
- **Visual Indicators** - Badge "Baru" untuk item terbaru
- **Responsive Sidebar** - Collapsible dengan toggle arrow
- **Real-time Updates** - Auto-refresh data tanpa reload halaman
- **Cross-component Communication** - Event-driven updates

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

- ✅ **PostgreSQL Database** - Auto-configured with persistent storage
- ✅ **Auto Migration** - Database schema setup on first run
- ✅ **Data Seeding** - Default accounts created automatically
- ✅ **File Storage** - Persistent uploads directory
- ✅ **Health Checks** - Automatic service monitoring with `/api/health`
- ✅ **Auto Restart** - Services restart on failure
- ✅ **Production Ready** - Optimized for production use
- ✅ **Improved Error Handling** - Better API error responses
- ✅ **No DDoS Protection** - Removed aggressive rate limiting that caused API errors

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
2. Masuk ke menu "Permohonan" atau "Chat"
3. Review permohonan masuk
4. Assign ke PPID Pelaksana jika diperlukan
5. Berikan tanggapan melalui chat
6. Upload file jawaban dan dokumen
7. Akhiri atau lanjutkan chat sesuai kebutuhan

### 💬 **Menggunakan Sistem Chat**

**Untuk Pemohon:**

1. Buat permohonan/keberatan baru
2. Otomatis diarahkan ke halaman chat
3. Chat muncul di daftar dengan status terkini
4. Kirim pesan dan file attachment
5. Tunggu balasan dari PPID

**Untuk PPID:**

1. Akses menu "Chat" untuk melihat semua percakapan
2. Tab "Chat Pemohon" untuk komunikasi dengan pemohon
3. Tab "Chat PPID" untuk komunikasi internal
4. Gunakan bulk actions untuk mengelola multiple chat
5. Teruskan permohonan ke PPID lain jika diperlukan

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
- `DELETE /api/permintaan/[id]/delete-chat` - Delete chat history
- `POST /api/permintaan/[id]/end-chat` - End chat session

### Keberatan

- `GET /api/keberatan` - Get objection list
- `POST /api/keberatan` - Create new objection
- `GET /api/keberatan/[id]` - Get objection detail
- `PUT /api/keberatan/[id]` - Update objection
- `POST /api/keberatan/[id]/responses` - Add response to objection
- `DELETE /api/keberatan/[id]/delete-chat` - Delete keberatan chat
- `POST /api/keberatan/[id]/end-chat` - End keberatan chat

### Chat System

- `GET /api/chat-list` - Get role-based chat list
- `GET /api/chat/[requestId]` - Get chat messages
- `POST /api/chat/[requestId]` - Send chat message
- `POST /api/chat/[requestId]/end` - End chat session
- `GET /api/ppid-chat` - Get PPID internal chat
- `POST /api/ppid-chat` - Send PPID internal message
- `POST /api/ppid-chat/mark-read` - Mark PPID chat as read

### Informasi Publik

- `GET /api/informasi` - Get public information list
- `POST /api/informasi` - Create information (PPID only)
- `GET /api/informasi/[id]` - Get information detail
- `PUT /api/informasi/[id]` - Update information
- `DELETE /api/informasi/[id]` - Delete information

### Admin Management

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get users list
- `POST /api/admin/assign-ppid` - Assign PPID to request/keberatan
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

### Statistics & Reports

- `GET /api/stats/public` - Get public statistics
- `GET /api/laporan` - Generate reports
- `GET /api/health` - Application health checkrmintaan` - Create new request
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

## 🔧 Development Tools

- **Prisma Studio** - Database GUI: `npx prisma studio`
- **Database Reset** - Reset & reseed: `npx prisma migrate reset`
- **Schema Sync** - Sync schema: `npx prisma db push`
- **Generate Client** - Update Prisma client: `npx prisma generate`

## 🚀 CI/CD & Deployment

### Automated Deployment

Setiap push ke branch `main` akan otomatis:

1. **Build Docker Image** - Multi-stage optimized build
2. **Push to Docker Hub** - Tagged dengan `latest` dan commit SHA
3. **Create Deployment Package** - Ready-to-deploy files

## 🌟 Keunggulan

- ✅ **Single Deployment** - Frontend dan backend dalam satu aplikasi
- ✅ **Docker Ready** - One-command deployment dengan Docker
- ✅ **Auto CI/CD** - Automated build dan deployment
- ✅ **Responsive Design** - Optimal di semua device
- ✅ **Role-Based Access** - Keamanan berlapis dengan assignment system
- ✅ **Real-time Updates** - Data selalu up-to-date dengan event-driven architecture
- ✅ **SEO Friendly** - Optimized untuk search engine
- ✅ **Easy Customization** - Interface admin untuk kustomisasi
- ✅ **File Management** - Upload dan manajemen file terintegrasi
- ✅ **Analytics Dashboard** - Monitoring dan reporting
- ✅ **Advanced Chat System** - Multi-role real-time communication dengan bulk management
- ✅ **Auto-display Chats** - Otomatis tampilkan semua permohonan/keberatan sebagai chat
- ✅ **Smart Assignment** - Chat berpindah otomatis saat diteruskan ke PPID lain
- ✅ **Cross-tab Sync** - Sinkronisasi real-time antar tab browser
- ✅ **Enhanced UX** - Auto-redirect, visual indicators, dan notifikasi
- ✅ **Comprehensive Testing** - Full test coverage
- ✅ **PostgreSQL + Prisma** - Modern database stack
- ✅ **Production Ready** - Optimized untuk production deployment

### Performance Optimization

- **DDoS Protection**: Removed aggressive rate limiting that caused API errors
- **Database Connection**: Improved connection handling with timeouts
- **Error Handling**: Better error responses for debugging
- **Health Monitoring**: Added `/api/health` endpoint for monitoring

## 🆕 Fitur Terbaru

### Chat System Enhancement

- **Auto-display All Requests** - Semua permohonan/keberatan otomatis muncul sebagai chat
- **Role-based Chat Visibility** - PPID melihat chat sesuai assignment
- **Bulk Chat Management** - Delete dan end multiple chats sekaligus
- **Real-time Notifications** - Badge notifikasi untuk chat baru
- **Cross-tab Communication** - Event-driven updates antar tab

### User Experience Improvements

- **Auto-redirect to Chat** - Langsung ke chat setelah buat permohonan/keberatan
- **Visual New Indicators** - Badge "Baru" untuk item terbaru
- **Enhanced Sidebar** - Collapsible dengan arrow toggle yang jelas
- **Improved Navigation** - Link yang benar ke semua halaman chat

### Technical Enhancements

- **New API Endpoints** - Bulk delete/end chat, enhanced chat-list
- **Better Error Handling** - Graceful fallbacks dan user feedback
- **Performance Optimization** - Efficient data fetching dan caching
- **Code Organization** - Cleaner component structure dan reusability

**Dikembangkan untuk PPID Diskominfo Kabupaten Garut** 🏛️
