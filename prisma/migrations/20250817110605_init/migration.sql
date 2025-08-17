-- CreateTable
CREATE TABLE "public"."admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" TEXT DEFAULT 'ADMIN',
    "permissions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pemohon" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT,
    "no_telepon" TEXT,
    "alamat" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pemohon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ppid" (
    "id" SERIAL NOT NULL,
    "no_pegawai" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PPID_PELAKSANA',
    "permissions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ppid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."requests" (
    "id" SERIAL NOT NULL,
    "pemohon_id" INTEGER NOT NULL,
    "judul" TEXT,
    "rincian_informasi" TEXT NOT NULL,
    "tujuan_penggunaan" TEXT NOT NULL,
    "cara_memperoleh_informasi" TEXT NOT NULL DEFAULT 'Email',
    "cara_mendapat_salinan" TEXT NOT NULL DEFAULT 'Email',
    "status" TEXT NOT NULL DEFAULT 'Diajukan',
    "catatan_ppid" TEXT,
    "file_attachments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."request_responses" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_sessions" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "ended_by" TEXT,
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kategori_informasi" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kategori_informasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."informasi_publik" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "klasifikasi" TEXT NOT NULL,
    "ringkasan_isi_informasi" TEXT NOT NULL,
    "file_attachments" TEXT,
    "links" TEXT,
    "tanggal_posting" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pejabat_penguasa_informasi" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "thumbnail" TEXT,
    "jadwal_publish" TIMESTAMP(3),
    "images" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "informasi_publik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity_logs" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "user_id" TEXT,
    "user_role" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."keberatan" (
    "id" SERIAL NOT NULL,
    "permintaan_id" INTEGER NOT NULL,
    "pemohon_id" INTEGER NOT NULL,
    "judul" TEXT,
    "alasan_keberatan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Diajukan',
    "catatan_ppid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keberatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pages" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "public"."admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pemohon_email_key" ON "public"."pemohon"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ppid_no_pegawai_key" ON "public"."ppid"("no_pegawai");

-- CreateIndex
CREATE UNIQUE INDEX "ppid_email_key" ON "public"."ppid"("email");

-- CreateIndex
CREATE UNIQUE INDEX "chat_sessions_request_id_key" ON "public"."chat_sessions"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_informasi_nama_key" ON "public"."kategori_informasi"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_informasi_slug_key" ON "public"."kategori_informasi"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "public"."pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "settings_key_key" ON "public"."settings"("key");

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_pemohon_id_fkey" FOREIGN KEY ("pemohon_id") REFERENCES "public"."pemohon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."request_responses" ADD CONSTRAINT "request_responses_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_sessions" ADD CONSTRAINT "chat_sessions_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keberatan" ADD CONSTRAINT "keberatan_permintaan_id_fkey" FOREIGN KEY ("permintaan_id") REFERENCES "public"."requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keberatan" ADD CONSTRAINT "keberatan_pemohon_id_fkey" FOREIGN KEY ("pemohon_id") REFERENCES "public"."pemohon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
