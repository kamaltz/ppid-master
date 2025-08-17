-- CreateTable
CREATE TABLE "public"."keberatan_responses" (
    "id" SERIAL NOT NULL,
    "keberatan_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT,
    "message_type" TEXT NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keberatan_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kategori" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kategori_nama_key" ON "public"."kategori"("nama");

-- AddForeignKey
ALTER TABLE "public"."keberatan_responses" ADD CONSTRAINT "keberatan_responses_keberatan_id_fkey" FOREIGN KEY ("keberatan_id") REFERENCES "public"."keberatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
