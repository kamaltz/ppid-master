import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const { status } = await request.json();
    const id = parseInt(params.id);

    // Role-based access control
    if (decoded.role === 'PPID_PELAKSANA') {
      // PPID Pelaksana can only update keberatan that are 'Diproses' to 'Selesai'
      const existingKeberatan = await prisma.keberatan.findUnique({ where: { id } });
      if (!existingKeberatan || existingKeberatan.status !== 'Diproses' || status !== 'Selesai') {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    const keberatan = await prisma.keberatan.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Status keberatan berhasil diperbarui', 
      data: keberatan 
    });
  } catch (error) {
    console.error('Update keberatan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const id = parseInt(params.id);

    await prisma.keberatan.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Keberatan berhasil dihapus' 
    });
  } catch (error) {
    console.error('Delete keberatan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}