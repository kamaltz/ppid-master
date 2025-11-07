import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { role: string };
    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setting = await prisma.setting.findFirst({
      where: { key: 'default_password' }
    });

    return NextResponse.json({
      success: true,
      password: setting?.value || 'Garut@2025?'
    });
  } catch (error) {
    console.error('Get default password error:', error);
    return NextResponse.json({ error: 'Failed to get default password' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { role: string };
    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();
    
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key: 'default_password' },
      update: { value: password },
      create: { key: 'default_password', value: password }
    });

    return NextResponse.json({
      success: true,
      message: 'Password default berhasil diubah'
    });
  } catch (error) {
    console.error('Update default password error:', error);
    return NextResponse.json({ error: 'Failed to update default password' }, { status: 500 });
  }
}
