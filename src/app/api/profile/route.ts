import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface JWTPayload {
  role: string;
  id: string;
  email: string;
  nama?: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    let user;
    if (decoded.role === 'ADMIN') {
      user = await prisma.admin.findUnique({
        where: { id: parseInt(decoded.id) },
        select: { id: true, nama: true, email: true, created_at: true }
      });
    } else if (decoded.role === 'PEMOHON') {
      user = await prisma.pemohon.findUnique({
        where: { id: parseInt(decoded.id) },
        select: { id: true, nama: true, email: true, nik: true, no_telepon: true, created_at: true }
      });
    } else if (['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(decoded.role)) {
      user = await prisma.ppid.findUnique({
        where: { id: parseInt(decoded.id) },
        select: { id: true, nama: true, email: true, role: true, no_pegawai: true, created_at: true }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: { ...user, role: decoded.role }
    });
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const { nama, email, currentPassword, newPassword, ...otherData } = await request.json();

    if (!nama || !email) {
      return NextResponse.json({ error: 'Nama dan email wajib diisi' }, { status: 400 });
    }

    // If changing password, validate current password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Password saat ini diperlukan' }, { status: 400 });
      }

      let user;
      if (decoded.role === 'ADMIN') {
        user = await prisma.admin.findUnique({ where: { id: parseInt(decoded.id) } });
      } else if (decoded.role === 'PEMOHON') {
        user = await prisma.pemohon.findUnique({ where: { id: parseInt(decoded.id) } });
      } else if (['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(decoded.role)) {
        user = await prisma.ppid.findUnique({ where: { id: parseInt(decoded.id) } });
      }

      if (!user || !await bcrypt.compare(currentPassword, user.hashed_password)) {
        return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
      }
    }

    // Update user data
    const updateData: any = { nama, email };
    if (newPassword) {
      updateData.hashed_password = await bcrypt.hash(newPassword, 10);
    }

    // Add role-specific fields
    if (decoded.role === 'PEMOHON' && otherData.nik) {
      updateData.nik = otherData.nik;
    }
    if (decoded.role === 'PEMOHON' && otherData.no_telepon) {
      updateData.no_telepon = otherData.no_telepon;
    }

    let updatedUser;
    if (decoded.role === 'ADMIN') {
      updatedUser = await prisma.admin.update({
        where: { id: parseInt(decoded.id) },
        data: updateData,
        select: { id: true, nama: true, email: true }
      });
    } else if (decoded.role === 'PEMOHON') {
      updatedUser = await prisma.pemohon.update({
        where: { id: parseInt(decoded.id) },
        data: updateData,
        select: { id: true, nama: true, email: true, nik: true, no_telepon: true }
      });
    } else if (['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(decoded.role)) {
      updatedUser = await prisma.ppid.update({
        where: { id: parseInt(decoded.id) },
        data: updateData,
        select: { id: true, nama: true, email: true, role: true }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Profil berhasil diperbarui',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}