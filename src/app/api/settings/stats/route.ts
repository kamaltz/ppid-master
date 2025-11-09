import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';

export async function GET(request: NextRequest) {
  try {
    const statsSettings = await prisma.setting.findUnique({
      where: { key: 'homepage_stats' }
    });

    let config = {
      mode: 'auto' as 'manual' | 'auto',
      manual: {
        permintaanSelesai: 150,
        rataRataHari: 7,
        totalInformasi: 85,
        aksesOnline: '24/7'
      }
    };

    if (statsSettings?.value) {
      try {
        config = JSON.parse(statsSettings.value);
      } catch (error) {
        console.error('Error parsing stats config:', error);
      }
    }

    const [completedRequests, totalInformation] = await Promise.all([
      prisma.request.count({
        where: { status: 'Selesai' }
      }),
      prisma.informasiPublik.count()
    ]);

    const autoStats = {
      permintaanSelesai: completedRequests,
      rataRataHari: 7,
      totalInformasi: totalInformation,
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
      success: false,
      error: 'Failed to fetch stats config'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    if (!config.mode || !['auto', 'manual'].includes(config.mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: 'homepage_stats' },
      update: { value: JSON.stringify(config) },
      create: { key: 'homepage_stats', value: JSON.stringify(config) }
    });

    return NextResponse.json({
      success: true,
      message: 'Stats config saved successfully'
    });
  } catch (error) {
    console.error('Error saving stats config:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Failed to save stats config' 
    }, { status: 500 });
  }
}