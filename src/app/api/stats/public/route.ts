import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';

export async function GET() {
  try {
    // Get statistics settings
    const statsSettings = await prisma.setting.findUnique({
      where: { key: 'homepage_stats' }
    });

    let statsConfig = {
      mode: 'manual', // 'manual' or 'auto'
      manual: {
        permintaanSelesai: 150,
        rataRataHari: 7,
        totalInformasi: 85,
        aksesOnline: '24/7'
      }
    };

    if (statsSettings) {
      try {
        statsConfig = JSON.parse(statsSettings.value);
      } catch (error) {
        console.error('Error parsing stats config:', error);
      }
    }

    if (statsConfig.mode === 'auto') {
      // Get automatic statistics from database
      const [
        completedRequests,
        totalInformation,
        avgProcessingTime
      ] = await Promise.all([
        prisma.request.count({
          where: { status: 'Selesai' }
        }),
        prisma.informasiPublik.count({
          where: { status: 'published' }
        }),
        prisma.request.findMany({
          where: { 
            status: 'Selesai',
            updated_at: { not: null }
          },
          select: {
            created_at: true,
            updated_at: true
          }
        })
      ]);

      // Calculate average processing days
      let avgDays = 7; // default
      if (avgProcessingTime.length > 0) {
        const totalDays = avgProcessingTime.reduce((sum, req) => {
          const start = new Date(req.created_at);
          const end = new Date(req.updated_at!);
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);
        avgDays = Math.round(totalDays / avgProcessingTime.length);
      }

      return NextResponse.json({
        success: true,
        data: {
          permintaanSelesai: completedRequests,
          rataRataHari: avgDays,
          totalInformasi: totalInformation,
          aksesOnline: '24/7'
        }
      });
    } else {
      // Return manual statistics
      return NextResponse.json({
        success: true,
        data: statsConfig.manual
      });
    }
  } catch (error) {
    console.error('Error fetching public stats:', error);
    
    // Return default stats on error
    return NextResponse.json({
      success: true,
      data: {
        permintaanSelesai: 150,
        rataRataHari: 7,
        totalInformasi: 85,
        aksesOnline: '24/7'
      }
    });
  }
}