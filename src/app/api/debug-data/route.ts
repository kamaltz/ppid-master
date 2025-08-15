import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';

export async function GET() {
  try {
    const requests = await prisma.request.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        pemohon: true
      }
    });

    console.log('Raw database data:', requests);
    
    return NextResponse.json({ 
      success: true,
      count: requests.length,
      data: requests.map(r => ({
        id: r.id,
        created_at: r.created_at,
        created_at_type: typeof r.created_at,
        created_at_iso: r.created_at.toISOString(),
        pemohon_nama: r.pemohon?.nama,
        rincian_informasi: r.rincian_informasi
      }))
    });
  } catch (error: unknown) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}