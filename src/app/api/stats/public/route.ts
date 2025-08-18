import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple hardcoded stats for now to test
    const result = {
      totalPermintaan: 25,
      permintaanSelesai: 18,
      rataRataHari: 5,
      totalInformasi: 42
    };

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stats'
    }, { status: 500 });
  }
}