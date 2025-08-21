import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import bcrypt from 'bcryptjs';
import { strictRateLimit } from '../../../../lib/rateLimiter';
import { getClientIP } from '../../../../lib/ipUtils';
import { sanitizeInput, validateEmail } from '../../../../lib/xssProtection';

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for registration.' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Basic rate limiting for registration
    const clientIP = getClientIP(request);
    const rateLimitResult = strictRateLimit(`register:${clientIP}`, 5, 300000); // 5 requests per 5 minutes
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, nama, role, no_telepon, alamat, no_pegawai, nik } = body;
    
    // Sanitize inputs
    const sanitizedData = {
      email: sanitizeInput(email || ''),
      nama: sanitizeInput(nama || ''),
      role: sanitizeInput(role || ''),
      no_telepon: sanitizeInput(no_telepon || ''),
      alamat: sanitizeInput(alamat || ''),
      no_pegawai: sanitizeInput(no_pegawai || ''),
      nik: sanitizeInput(nik || '')
    };
    
    // Enhanced validation
    if (!sanitizedData.email || !password || !sanitizedData.nama) {
      return NextResponse.json(
        { error: "Email, password, dan nama wajib diisi." },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(sanitizedData.email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingAdmin, existingPpid, existingPemohon] = await Promise.all([
      prisma.admin.findUnique({ where: { email: sanitizedData.email } }),
      prisma.ppid.findUnique({ where: { email: sanitizedData.email } }),
      prisma.pemohon.findUnique({ where: { email: sanitizedData.email } })
    ]);

    if (existingAdmin || existingPpid || existingPemohon) {
      return NextResponse.json(
        { error: "Email sudah terdaftar." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    const userRole = sanitizedData.role || 'pemohon'; // Default to pemohon if no role specified
    
    switch (userRole.toLowerCase()) {
      case 'admin':
        newUser = await prisma.admin.create({
          data: {
            email: sanitizedData.email,
            hashed_password: hashedPassword,
            nama: sanitizedData.nama
          }
        });
        break;
        
      case 'ppid':
        if (!sanitizedData.no_pegawai) {
          return NextResponse.json(
            { error: "No pegawai wajib diisi untuk PPID." },
            { status: 400 }
          );
        }
        newUser = await prisma.ppid.create({
          data: {
            email: sanitizedData.email,
            hashed_password: hashedPassword,
            nama: sanitizedData.nama,
            no_pegawai: sanitizedData.no_pegawai,
            role: 'PPID'
          }
        });
        break;
        
      case 'pemohon':
      default:
        if (!sanitizedData.nik) {
          return NextResponse.json(
            { error: "NIK wajib diisi untuk pemohon." },
            { status: 400 }
          );
        }
        newUser = await prisma.pemohon.create({
          data: {
            email: sanitizedData.email,
            hashed_password: hashedPassword,
            nama: sanitizedData.nama,
            nik: sanitizedData.nik,
            no_telepon: sanitizedData.no_telepon || null,
            alamat: sanitizedData.alamat || null
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