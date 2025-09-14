import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const statsSettings = await prisma.setting.findUnique({
      where: { key: 'homepage_stats' }
    });

    let config = {
      mode: 'manual',
      manual: {
        permintaanSelesai: 150,
        rataRataHari: 7,
        totalInformasi: 85,
        aksesOnline: '24/7'
      }
    };

    if (statsSettings) {
      try {
        config = JSON.parse(statsSettings.value);
      } catch (error) {
        console.error('Error parsing stats config:', error);
      }
    }

    return NextResponse.json({
      success: true,
      config: config
    });
  } catch (error) {
    console.error('Error fetching stats config:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const config = await request.json();

    await prisma.setting.upsert({
      where: { key: 'homepage_stats' },
      update: { value: JSON.stringify(config) },
      create: { key: 'homepage_stats', value: JSON.stringify(config) }
    });

    return NextResponse.json({
      success: true,
      message: 'Pengaturan statistik berhasil disimpan'
    });
  } catch (error) {
    console.error('Error saving stats config:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}