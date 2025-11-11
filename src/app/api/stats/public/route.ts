import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';

export async function GET() {
  console.log('🏠 [PUBLIC-API] Stats API called');
  
  try {
    // Step 1: Get settings
    console.log('🏠 [PUBLIC-API] Step 1: Getting settings...');
    const statsSettings = await prisma.setting.findUnique({
      where: { key: 'homepage_stats' }
    });
    console.log('🏠 [PUBLIC-API] Settings result:', statsSettings);
    
    // Step 2: Parse config
    console.log('🏠 [PUBLIC-API] Step 2: Parsing config...');
    let statsConfig = { mode: 'auto', manual: {} };
    if (statsSettings?.value) {
      statsConfig = JSON.parse(statsSettings.value);
    }
    console.log('🏠 [PUBLIC-API] Config:', statsConfig);
    
    // Step 3: Get database counts
    console.log('🏠 [PUBLIC-API] Step 3: Getting database counts...');
    const completedRequests = await prisma.request.count({
      where: { status: 'Selesai' }
    });
    console.log('🏠 [PUBLIC-API] Completed requests:', completedRequests);
    
    const totalInformation = await prisma.informasiPublik.count();
    console.log('🏠 [PUBLIC-API] Total information:', totalInformation);
    
    // Step 4: Build response
    const autoData = {
      permintaanSelesai: completedRequests,
      rataRataHari: 5,
      totalInformasi: totalInformation,
      aksesOnline: '24/7'
    };
    
    console.log('🏠 [PUBLIC-API] Final data:', autoData);
    
    return NextResponse.json({
      success: true,
      data: autoData
    });
    
  } catch (error) {
    console.error('🏠 [PUBLIC-API] ERROR:', error);
    console.error('🏠 [PUBLIC-API] ERROR STACK:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        permintaanSelesai: 999,
        rataRataHari: 999,
        totalInformasi: 999,
        aksesOnline: '24/7'
      }
    });
  }
}