import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET!);

    const requestData = await prisma.request.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        pemohon: {
          select: { id: true, nama: true, email: true, nik: true, no_telepon: true, alamat: true }
        }
      }
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ data: requestData });
  } catch (error) {
    console.error('Get request error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET!);

    const { status, catatan_ppid } = await request.json();

    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(params.id) },
      data: {
        status,
        catatan_ppid,
        updated_at: new Date()
      },
      include: {
        pemohon: {
          select: { id: true, nama: true, email: true, nik: true, no_telepon: true, alamat: true }
        }
      }
    });

    return NextResponse.json({ data: updatedRequest });
  } catch (error) {
    console.error('Update request error:', error);
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
    jwt.verify(token, process.env.JWT_SECRET!);

    await prisma.request.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}