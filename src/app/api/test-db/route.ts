import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';

export async function GET() {
  try {
    const permintaanCount = await prisma.permintaan.count();
    const tanggapanCount = await prisma.tanggapan.count();
    
    return NextResponse.json({
      success: true,
      data: {
        dbConnection: 'OK',
        permintaanCount,
        tanggapanCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}