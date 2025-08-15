import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany({
      orderBy: { updated_at: 'desc' }
    });
    
    return NextResponse.json({
      success: true,
      count: settings.length,
      data: settings.map(s => ({
        key: s.key,
        value: s.value.substring(0, 100) + (s.value.length > 100 ? '...' : ''),
        updated_at: s.updated_at
      }))
    });
  } catch (error: unknown) {
    console.error('Error fetching debug settings:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}