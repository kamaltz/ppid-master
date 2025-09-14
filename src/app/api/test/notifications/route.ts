import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';

export async function GET() {
  try {
    const pendingCount = await prisma.pemohon.count({
      where: { is_approved: false }
    });

    const allPemohon = await prisma.pemohon.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        is_approved: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({
      success: true,
      pendingCount,
      totalPemohon: allPemohon.length,
      pendingAccounts: allPemohon.filter(p => !p.is_approved),
      approvedAccounts: allPemohon.filter(p => p.is_approved)
    });
  } catch (error) {
    console.error('Error in test notifications:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}