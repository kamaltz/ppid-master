import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';

export async function GET(request: NextRequest) {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        permissions: true
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: admins,
      count: admins.length 
    });
  } catch (error) {
    console.error('Test users error:', error);
    return NextResponse.json({ 
      error: error.message || 'Server error',
      stack: error.stack 
    }, { status: 500 });
  }
}