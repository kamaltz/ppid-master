import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
  email: string;
}

export async function GET(
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

    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id: accountId } = await params;
    const numericId = parseInt(accountId);
    
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    // Search all tables for the account
    const [admin, pemohon, ppid] = await Promise.all([
      prisma.admin.findUnique({ 
        where: { id: numericId },
        select: { id: true, nama: true, email: true, created_at: true }
      }),
      prisma.pemohon.findUnique({ 
        where: { id: numericId },
        select: { id: true, nama: true, email: true, nik: true, created_at: true }
      }),
      prisma.ppid.findUnique({ 
        where: { id: numericId },
        select: { id: true, nama: true, email: true, role: true, created_at: true }
      })
    ]);

    let account = null;
    if (admin) {
      account = { ...admin, role: 'Admin', type: 'admin' };
    } else if (pemohon) {
      account = { ...pemohon, role: 'Pemohon', type: 'pemohon' };
    } else if (ppid) {
      account = { ...ppid, type: 'ppid' };
    }

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    console.error('Get account error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
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

    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { nama, email } = await request.json();
    const { id } = await params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    // Try to update in all tables
    let updatedAccount = null;
    
    try {
      updatedAccount = await prisma.admin.update({
        where: { id: numericId },
        data: { nama, email }
      });
      updatedAccount = { ...updatedAccount, role: 'Admin' };
    } catch {
      try {
        updatedAccount = await prisma.pemohon.update({
          where: { id: numericId },
          data: { nama, email }
        });
        updatedAccount = { ...updatedAccount, role: 'Pemohon' };
      } catch {
        try {
          updatedAccount = await prisma.ppid.update({
            where: { id: numericId },
            data: { nama, email }
          });
        } catch {
          return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Akun berhasil diperbarui',
      data: updatedAccount
    });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
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

    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    // Try to delete from all tables
    let deleted = false;
    
    try {
      await prisma.admin.delete({ where: { id: numericId } });
      deleted = true;
    } catch {
      try {
        // Delete related records first for pemohon
        await prisma.keberatan.deleteMany({ where: { pemohon_id: numericId } });
        await prisma.request.deleteMany({ where: { pemohon_id: numericId } });
        await prisma.pemohon.delete({ where: { id: numericId } });
        deleted = true;
      } catch {
        try {
          await prisma.ppid.delete({ where: { id: numericId } });
          deleted = true;
        } catch {
          // Account not found in any table
        }
      }
    }

    if (!deleted) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Akun berhasil dihapus' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}