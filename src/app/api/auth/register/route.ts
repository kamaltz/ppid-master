import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, nama, nik, no_telepon, alamat, pekerjaan } = body;
    
    // Basic validation
    if (!email || !password || !nama || !nik) {
      return NextResponse.json(
        { error: "Email, password, nama, dan NIK wajib diisi." },
        { status: 400 }
      );
    }

    // Validate NIK format
    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json(
        { error: "NIK harus 16 digit angka." },
        { status: 400 }
      );
    }

    // Check if email already exists across all user types
    const existingUsers = await Promise.allSettled([
      prisma.admin.findUnique({ where: { email } }),
      prisma.ppid.findUnique({ where: { email } }),
      prisma.pemohon.findUnique({ where: { email } })
    ]);

    const hasExistingEmail = existingUsers.some(result => 
      result.status === 'fulfilled' && result.value !== null
    );

    if (hasExistingEmail) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    // Check if NIK already exists
    const existingNik = await prisma.pemohon.findFirst({ 
      where: { nik } 
    });
    
    if (existingNik) {
      return NextResponse.json(
        { error: "NIK sudah terdaftar." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new pemohon
    const newUser = await prisma.pemohon.create({
      data: {
        email,
        hashed_password: hashedPassword,
        nama,
        nik,
        no_telepon: no_telepon || null,
        alamat: alamat || null,
        pekerjaan: pekerjaan || null,
        is_approved: false
      }
    });

    return NextResponse.json({
      message: "Registrasi berhasil. Akun Anda menunggu persetujuan Admin/PPID Utama sebelum dapat mengajukan permohonan.",
      user: {
        id: newUser.id,
        email: newUser.email,
        nama: newUser.nama,
        role: 'pemohon',
        is_approved: false
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Register API error:', error);
    
    // Handle Prisma unique constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        const target = (error as any).meta?.target;
        if (target?.includes('email')) {
          return NextResponse.json(
            { error: 'Email sudah terdaftar.' },
            { status: 400 }
          );
        }
        if (target?.includes('nik')) {
          return NextResponse.json(
            { error: 'NIK sudah terdaftar.' },
            { status: 400 }
          );
        }
      }
    }
    
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}