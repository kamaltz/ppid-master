import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface JWTPayload {
  role: string;
  id: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { accountId } = await request.json();
    
    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    const [table, id] = accountId.split('_');
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    const defaultPasswordSetting = await prisma.setting.findFirst({
      where: { key: 'default_password' }
    });
    const defaultPassword = defaultPasswordSetting?.value || 'Garut@2025?';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    switch (table) {
      case 'admin':
        await prisma.admin.update({
          where: { id: numericId },
          data: { hashed_password: hashedPassword }
        });
        break;
      case 'pemohon':
        await prisma.pemohon.update({
          where: { id: numericId },
          data: { hashed_password: hashedPassword }
        });
        break;
      case 'ppid':
        await prisma.ppid.update({
          where: { id: numericId },
          data: { hashed_password: hashedPassword }
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}