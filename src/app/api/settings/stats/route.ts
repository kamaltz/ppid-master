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
    // Get stats config
    const statsSettings = await prisma.setting.findUnique({
      where: { key: 'homepage_stats' }
    });

    let config = {
      mode: 'auto',
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

    // Get auto stats from database
    const [requestCount, informasiCount, completedRequests] = await Promise.all([
      prisma.request.count(),
      prisma.informasiPublik.count(),
      prisma.request.findMany({
        where: { 
          status: 'Selesai'
        },
        select: {
          created_at: true,
          updated_at: true
        },
        take: 50 // Limit for performance
      })
    ]);

    // Calculate average processing days
    let avgDays = 7;
    if (completedRequests.length > 0) {
      const totalDays = completedRequests.reduce((sum, req) => {
        const start = new Date(req.created_at);
        const end = new Date(req.updated_at!);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      avgDays = Math.round(totalDays / completedRequests.length);
    }

    const autoStats = {
      permintaanSelesai: requestCount,
      rataRataHari: avgDays,
      totalInformasi: informasiCount,
      aksesOnline: '24/7'
    };

    return NextResponse.json({
      success: true,
      config: config,
      autoStats: autoStats
    });
  } catch (error) {
    console.error('Error fetching stats config:', error);
    return NextResponse.json({ 
      success: true,
      config: {
        mode: 'auto',
        manual: {
          permintaanSelesai: 150,
          rataRataHari: 7,
          totalInformasi: 85,
          aksesOnline: '24/7'
        }
      },
      autoStats: {
        permintaanSelesai: 0,
        rataRataHari: 7,
        totalInformasi: 0,
        aksesOnline: '24/7'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    // Validate config structure
    if (!config.mode || !['auto', 'manual'].includes(config.mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    if (config.mode === 'manual' && !config.manual) {
      return NextResponse.json({ error: 'Manual config required' }, { status: 400 });
    }

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
    return NextResponse.json({ 
      success: false,
      error: 'Terjadi kesalahan saat menyimpan pengaturan' 
    }, { status: 500 });
  }
}