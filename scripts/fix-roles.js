import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fixRoles() {
  console.log("🔧 Fixing PPID roles...");

  try {
    // Update PPID_Utama to PPID_UTAMA
    const utamaUpdate = await prisma.ppid.updateMany({
      where: { role: "PPID_Utama" },
      data: { role: "PPID_UTAMA" }
    });
    console.log(`✅ Updated ${utamaUpdate.count} PPID_Utama to PPID_UTAMA`);

    // Update PPID_Pelaksana to PPID_PELAKSANA  
    const pelaksanaUpdate = await prisma.ppid.updateMany({
      where: { role: "PPID_Pelaksana" },
      data: { role: "PPID_PELAKSANA" }
    });
    console.log(`✅ Updated ${pelaksanaUpdate.count} PPID_Pelaksana to PPID_PELAKSANA`);

    // Update Atasan_PPID to ATASAN_PPID
    const atasanUpdate = await prisma.ppid.updateMany({
      where: { role: "Atasan_PPID" },
      data: { role: "ATASAN_PPID" }
    });
    console.log(`✅ Updated ${atasanUpdate.count} Atasan_PPID to ATASAN_PPID`);

    console.log("🎉 Role fixing completed!");
  } catch (error) {
    console.error("❌ Error fixing roles:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRoles();