-- AlterTable
ALTER TABLE "public"."keberatan" ADD COLUMN     "assigned_to" INTEGER;

-- AlterTable
ALTER TABLE "public"."requests" ADD COLUMN     "assigned_to" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."requests" ADD CONSTRAINT "requests_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."ppid"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keberatan" ADD CONSTRAINT "keberatan_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."ppid"("id") ON DELETE SET NULL ON UPDATE CASCADE;
