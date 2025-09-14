import { prisma } from '../../lib/prismaClient';

export async function checkKeberatanForRequest(pemohonId: number, requestId: number): Promise<{ canSubmit: boolean; hasExisting: boolean }> {
  const existing = await prisma.keberatan.findFirst({
    where: {
      pemohon_id: pemohonId,
      permintaan_id: requestId
    }
  });

  return {
    canSubmit: !existing,
    hasExisting: !!existing
  };
}