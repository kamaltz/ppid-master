import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
  email: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (decoded.role !== 'Admin' && decoded.role !== 'PPID_UTAMA') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    await prisma.ppid.delete({ where: { id: numericId } });

    return NextResponse.json({ success: true, message: 'Akun PPID berhasil dihapus' });
  } catch (error) {
    console.error('Delete PPID error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}