import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface UserResult {
  id: number;
  email: string;
  hashed_password: string;
  nama: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Login API called');
    const { email, password } = await request.json();
    console.log('📧 Email:', email);
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET not found');
      return NextResponse.json(
        { error: "JWT secret tidak dikonfigurasi." },
        { status: 500 }
      );
    }
    
    console.log('🔍 Searching for user...');

    // Find user across all tables
    const [adminUser, ppidUser, pemohonUser] = await Promise.all([
      prisma.admin.findUnique({ where: { email } }),
      prisma.ppid.findUnique({ where: { email } }),
      prisma.pemohon.findUnique({ where: { email } })
    ]);
    
    console.log('👥 Users found:', { admin: !!adminUser, ppid: !!ppidUser, pemohon: !!pemohonUser });

    let user: UserResult | null = null;

    if (adminUser) {
      user = { ...adminUser, role: "Admin" };
      console.log('✅ Admin user found');
    } else if (ppidUser) {
      // Special role assignments based on email
      let role = ppidUser.role || "PPID";
      if (ppidUser.email === 'ppid.pelaksana@garut.go.id') {
        role = 'PPID_PELAKSANA';
      } else if (ppidUser.email === 'atasan.ppid@garut.go.id') {
        role = 'ATASAN_PPID';
      }
      user = { ...ppidUser, role };
      console.log('✅ PPID user found with role:', role);
    } else if (pemohonUser) {
      user = { ...pemohonUser, role: "Pemohon" };
      console.log('✅ Pemohon user found');
    }

    if (!user) {
      console.log('❌ No user found');
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Password salah." },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        nama: user.nama
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    return NextResponse.json({
      message: "Login berhasil", 
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Login API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server: ' + (error as Error).message },
      { status: 500 }
    );
  }
}