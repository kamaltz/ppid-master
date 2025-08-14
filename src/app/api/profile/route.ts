import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    let user = null;
    if (decoded.role === 'Admin') {
      user = await prisma.admin.findUnique({ where: { id: decoded.userId } });
    } else if (decoded.role === 'Pemohon') {
      user = await prisma.pemohon.findUnique({ where: { id: decoded.userId } });
    } else {
      user = await prisma.ppid.findUnique({ where: { id: decoded.userId } });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { nama, email, no_telepon, alamat, currentPassword, newPassword } = await request.json();

    let updateData: any = { nama, email };
    
    if (decoded.role === 'Pemohon') {
      updateData.no_telepon = no_telepon;
      updateData.alamat = alamat;
    }

    if (newPassword && currentPassword) {
      let user = null;
      if (decoded.role === 'Admin') {
        user = await prisma.admin.findUnique({ where: { id: decoded.userId } });
      } else if (decoded.role === 'Pemohon') {
        user = await prisma.pemohon.findUnique({ where: { id: decoded.userId } });
      } else {
        user = await prisma.ppid.findUnique({ where: { id: decoded.userId } });
      }

      if (!user || !await bcrypt.compare(currentPassword, user.hashed_password)) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      updateData.hashed_password = await bcrypt.hash(newPassword, 10);
    }

    let updatedUser = null;
    if (decoded.role === 'Admin') {
      updatedUser = await prisma.admin.update({
        where: { id: decoded.userId },
        data: updateData
      });
    } else if (decoded.role === 'Pemohon') {
      updatedUser = await prisma.pemohon.update({
        where: { id: decoded.userId },
        data: updateData
      });
    } else {
      updatedUser = await prisma.ppid.update({
        where: { id: decoded.userId },
        data: updateData
      });
    }

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}