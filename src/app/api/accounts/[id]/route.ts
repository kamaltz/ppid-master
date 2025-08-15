import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  id: string;
  email: string;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const accountId = params.id;
    const [table, id] = accountId.split('_');
    const numericId = parseInt(id);

    if (!table || !id || isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    // Delete from appropriate table with cascade handling
    if (table === 'admin') {
      await prisma.admin.delete({ where: { id: numericId } });
    } else if (table === 'pemohon') {
      // Delete related records first to avoid foreign key constraint errors
      await prisma.keberatan.deleteMany({ where: { pemohon_id: numericId } });
      await prisma.request.deleteMany({ where: { pemohon_id: numericId } });
      await prisma.pemohon.delete({ where: { id: numericId } });
    } else if (table === 'ppid') {
      await prisma.ppid.delete({ where: { id: numericId } });
    } else {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Akun berhasil dihapus' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}