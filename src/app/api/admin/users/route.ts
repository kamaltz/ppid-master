import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface JWTPayload {
  role: string;
  id: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [admins, ppids, pemohons] = await Promise.all([
      prisma.admin.findMany({ select: { id: true, email: true, nama: true, created_at: true } }),
      prisma.ppid.findMany({ select: { id: true, email: true, nama: true, no_pegawai: true, role: true, created_at: true } }),
      prisma.pemohon.findMany({ select: { id: true, email: true, nama: true, no_telepon: true, alamat: true, created_at: true } })
    ]);

    const users = [
      ...admins.map(u => ({ ...u, role: 'Admin', type: 'admin' })),
      ...ppids.map(u => ({ ...u, type: 'ppid' })),
      ...pemohons.map(u => ({ ...u, role: 'Pemohon', type: 'pemohon' }))
    ];

    return NextResponse.json({ data: users });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email, password, nama, role, no_telepon, alamat, no_pegawai } = await request.json();
    
    if (!email || !password || !nama || !role) {
      return NextResponse.json({ error: 'Email, password, nama, dan role wajib diisi' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    switch (role.toLowerCase()) {
      case 'admin':
        newUser = await prisma.admin.create({
          data: { email, hashed_password: hashedPassword, nama }
        });
        break;
      case 'ppid':
        if (!no_pegawai) {
          return NextResponse.json({ error: 'No pegawai wajib untuk PPID' }, { status: 400 });
        }
        newUser = await prisma.ppid.create({
          data: { email, hashed_password: hashedPassword, nama, no_pegawai, role: 'PPID' }
        });
        break;
      case 'pemohon':
        newUser = await prisma.pemohon.create({
          data: { email, hashed_password: hashedPassword, nama, no_telepon, alamat }
        });
        break;
      default:
        return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
    }

    return NextResponse.json({ message: 'User berhasil dibuat', data: newUser }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}