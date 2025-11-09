import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';

export async function GET() {
  try {
    // Get specific homepage_stats setting
    const statsSettings = await prisma.setting.findUnique({
      where: { key: 'homepage_stats' }
    });
    
    // Get request counts by status
    const requestsByStatus = await prisma.request.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    // Get total counts
    const totalRequests = await prisma.request.count();
    const totalInformasi = await prisma.informasiPublik.count();
    const completedRequests = await prisma.request.count({
      where: { status: 'Selesai' }
    });
    
    return NextResponse.json({
      success: true,
      debug: {
        statsSettings,
        requestsByStatus,
        totals: {
          totalRequests,
          totalInformasi,
          completedRequests
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}