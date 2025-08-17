import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 });
    }

    // Check admin
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (admin) {
      const isValid = await bcrypt.compare(password, admin.hashed_password);
      if (isValid) {
        const token = jwt.sign(
          { id: admin.id, email: admin.email, nama: admin.nama, role: 'ADMIN' },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );
        return NextResponse.json({
          success: true,
          token,
          user: { id: admin.id, email: admin.email, nama: admin.nama, role: 'ADMIN' }
        });
      }
    }

    // Check PPID
    const ppid = await prisma.ppid.findUnique({ where: { email } });
    if (ppid) {
      const isValid = await bcrypt.compare(password, ppid.hashed_password);
      if (isValid) {
        const token = jwt.sign(
          { id: ppid.id, email: ppid.email, nama: ppid.nama, role: ppid.role },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );
        return NextResponse.json({
          success: true,
          token,
          user: { id: ppid.id, email: ppid.email, nama: ppid.nama, role: ppid.role }
        });
      }
    }

    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}