import { prisma } from '../../lib/prismaClient';

export async function checkDailyRequestLimit(pemohonId: number): Promise<{ canSubmit: boolean; count: number; limit: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.request.count({
    where: {
      pemohon_id: pemohonId,
      created_at: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  return {
    canSubmit: count < 5,
    count,
    limit: 5
  };
}

export async function checkDailyKeberatanLimit(pemohonId: number): Promise<{ canSubmit: boolean; count: number; limit: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const count = await prisma.keberatan.count({
    where: {
      pemohon_id: pemohonId,
      created_at: {
        gte: today,
        lt: tomorrow
      }
    }
  });

  return {
    canSubmit: count < 3,
    count,
    limit: 3
  };
}

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