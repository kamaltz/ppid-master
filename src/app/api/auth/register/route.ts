import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nama, role, no_telepon, alamat, no_pegawai, nik } = await request.json();
    
    if (!email || !password || !nama) {
      return NextResponse.json(
        { error: "Email, password, dan nama wajib diisi." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingAdmin, existingPpid, existingPemohon] = await Promise.all([
      prisma.admin.findUnique({ where: { email } }),
      prisma.ppid.findUnique({ where: { email } }),
      prisma.pemohon.findUnique({ where: { email } })
    ]);

    if (existingAdmin || existingPpid || existingPemohon) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    const userRole = role || 'pemohon'; // Default to pemohon if no role specified
    
    switch (userRole.toLowerCase()) {
      case 'admin':
        newUser = await prisma.admin.create({
          data: {
            email,
            hashed_password: hashedPassword,
            nama
          }
        });
        break;
        
      case 'ppid':
        if (!no_pegawai) {
          return NextResponse.json(
            { error: "No pegawai wajib diisi untuk PPID." },
            { status: 400 }
          );
        }
        newUser = await prisma.ppid.create({
          data: {
            email,
            hashed_password: hashedPassword,
            nama,
            no_pegawai,
            role: 'PPID'
          }
        });
        break;
        
      case 'pemohon':
      default:
        if (!nik) {
          return NextResponse.json(
            { error: "NIK wajib diisi untuk pemohon." },
            { status: 400 }
          );
        }
        newUser = await prisma.pemohon.create({
          data: {
            email,
            hashed_password: hashedPassword,
            nama,
            nik,
            no_telepon: no_telepon || null,
            alamat: alamat || null
          }
        });
        break;
    }

    return NextResponse.json({
      message: "Registrasi berhasil",
      user: {
        id: newUser.id,
        email: newUser.email,
        nama: newUser.nama,
        role: userRole
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}