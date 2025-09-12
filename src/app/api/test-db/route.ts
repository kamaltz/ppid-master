import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

export async function GET() {
  try {
    const adminCount = await prisma.admin.count();
    const pemohonCount = await prisma.pemohon.count();
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      counts: {
        admin: adminCount,
        pemohon: pemohonCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}