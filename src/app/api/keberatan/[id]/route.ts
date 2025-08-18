import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const keberatan = await prisma.keberatan.findUnique({
      where: { id },
      include: {
        pemohon: {
          select: {
            nama: true,
            email: true,
            nik: true,
            no_telepon: true,
            alamat: true
          }
        },
        permintaan: {
          select: {
            id: true,
            rincian_informasi: true
          }
        }
      }
    });

    if (!keberatan) {
      return NextResponse.json({ error: 'Keberatan not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: keberatan 
    });
  } catch (error) {
    console.error('Get keberatan detail error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}