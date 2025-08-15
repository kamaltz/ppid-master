import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    
    // Try to find user in all tables
    const [admin, ppid, pemohon] = await Promise.all([
      prisma.admin.findUnique({ where: { id: userId } }),
      prisma.ppid.findUnique({ where: { id: userId } }),
      prisma.pemohon.findUnique({ where: { id: userId } })
    ]);

    let user = null;
    if (admin) {
      user = { ...admin, role: 'Admin', type: 'admin' };
    } else if (ppid) {
      user = { ...ppid, type: 'ppid' };
    } else if (pemohon) {
      user = { ...pemohon, role: 'Pemohon', type: 'pemohon' };
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { nama, email } = await request.json();
    const { id } = await params;
    const userId = parseInt(id);

    let updatedUser = null;
    
    // Try updating in each table
    try {
      updatedUser = await prisma.admin.update({
        where: { id: userId },
        data: { nama, email }
      });
    } catch {
      try {
        updatedUser = await prisma.ppid.update({
          where: { id: userId },
          data: { nama, email }
        });
      } catch {
        try {
          updatedUser = await prisma.pemohon.update({
            where: { id: userId },
            data: { nama, email }
          });
        } catch {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User berhasil diperbarui',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);
    let deleted = false;

    // Try deleting from each table
    try {
      await prisma.admin.delete({ where: { id: userId } });
      deleted = true;
    } catch {
      try {
        await prisma.ppid.delete({ where: { id: userId } });
        deleted = true;
      } catch {
        try {
          // Delete related records first for pemohon
          await prisma.keberatan.deleteMany({ where: { pemohon_id: userId } });
          await prisma.request.deleteMany({ where: { pemohon_id: userId } });
          await prisma.pemohon.delete({ where: { id: userId } });
          deleted = true;
        } catch {
          // User not found in any table
        }
      }
    }

    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'User berhasil dihapus'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}