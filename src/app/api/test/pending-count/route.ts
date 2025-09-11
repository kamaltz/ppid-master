import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';

export async function GET() {
  try {
    const pendingCount = await prisma.pemohon.count({
      where: {
        is_approved: false
      }
    });

    const allPemohon = await prisma.pemohon.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        is_approved: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      pendingCount,
      totalPemohon: allPemohon.length,
      allPemohon
    });
  } catch (error) {
    console.error('Error checking pending accounts:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}