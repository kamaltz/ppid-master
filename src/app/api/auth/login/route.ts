import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt:', { email, password: password ? 'provided' : 'missing' });
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 });
    }

    // Check admin
    const admin = await prisma.admin.findUnique({ where: { email } });
    console.log('Admin found:', admin ? 'yes' : 'no');
    if (admin) {
      const isValid = await bcrypt.compare(password, admin.hashed_password);
      console.log('Admin password valid:', isValid);
      if (isValid) {
        const token = jwt.sign(
          { userId: admin.id, id: admin.id, email: admin.email, nama: admin.nama, role: 'ADMIN' },
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
    console.log('PPID found:', ppid ? 'yes' : 'no');
    if (ppid) {
      const isValid = await bcrypt.compare(password, ppid.hashed_password);
      console.log('PPID password valid:', isValid);
      if (isValid) {
        const token = jwt.sign(
          { userId: ppid.id, id: ppid.id, email: ppid.email, nama: ppid.nama, role: ppid.role },
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

    // Check Pemohon
    const pemohon = await prisma.pemohon.findUnique({ where: { email } });
    if (pemohon) {
      const isValid = await bcrypt.compare(password, pemohon.hashed_password);
      if (isValid) {
        const token = jwt.sign(
          { userId: pemohon.id, id: pemohon.id, email: pemohon.email, nama: pemohon.nama, role: 'PEMOHON' },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );
        return NextResponse.json({
          success: true,
          token,
          user: { id: pemohon.id, email: pemohon.email, nama: pemohon.nama, role: 'PEMOHON' }
        });
      }
    }

    console.log('No valid user found for email:', email);
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}