import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const { id } = await params;

    // Get request first to find pemohon_id
    const requestData = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      select: { pemohon_id: true }
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Get pemohon details
    const pemohonData = await prisma.pemohon.findUnique({
      where: { id: requestData.pemohon_id },
      select: {
        id: true,
        nama: true,
        email: true,
        nik: true,
        no_telepon: true,
        alamat: true,
        pekerjaan: true,
        ktp_image: true,
        created_at: true
      }
    });

    if (!pemohonData) {
      return NextResponse.json({ error: 'Pemohon not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: pemohonData });
  } catch (error) {
    console.error('Get pemohon details error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}