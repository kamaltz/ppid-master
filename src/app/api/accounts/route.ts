import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface JWTPayload {
  role: string;
  id: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch all accounts from different tables
    const [admins, pemohons, ppids] = await Promise.all([
      prisma.admin.findMany({
        select: {
          id: true,
          nama: true,
          email: true,
          created_at: true
        }
      }),
      prisma.pemohon.findMany({
        select: {
          id: true,
          nama: true,
          email: true,
          nik: true,
          is_approved: true,
          created_at: true
        }
      }),
      prisma.ppid.findMany({
        select: {
          id: true,
          nama: true,
          email: true,
          role: true,
          created_at: true
        }
      })
    ]);

    // Combine all accounts with role information
    const accounts = [
      ...admins.map(admin => ({
        id: `admin_${admin.id}`,
        nama: admin.nama,
        email: admin.email,
        role: 'ADMIN',
        status: 'Aktif',
        tanggal_dibuat: admin.created_at.toISOString().split('T')[0],
        table: 'admin'
      })),
      ...pemohons.map(pemohon => ({
        id: `pemohon_${pemohon.id}`,
        nama: pemohon.nama,
        email: pemohon.email,
        role: 'PEMOHON',
        status: pemohon.is_approved ? 'Aktif' : 'Menunggu Persetujuan',
        tanggal_dibuat: pemohon.created_at.toISOString().split('T')[0],
        nik: pemohon.nik,
        is_approved: pemohon.is_approved,
        table: 'pemohon'
      })),
      ...ppids.map(ppid => ({
        id: `ppid_${ppid.id}`,
        nama: ppid.nama,
        email: ppid.email,
        role: ppid.role,
        status: 'Aktif',
        tanggal_dibuat: ppid.created_at.toISOString().split('T')[0],
        table: 'ppid'
      }))
    ];

    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
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

    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { nama, email, role } = await request.json();

    if (!nama || !email || !role) {
      return NextResponse.json({ error: 'Nama, email, dan role wajib diisi' }, { status: 400 });
    }

    // Check if email already exists
    const [existingAdmin, existingPemohon, existingPpid] = await Promise.all([
      prisma.admin.findUnique({ where: { email } }),
      prisma.pemohon.findUnique({ where: { email } }),
      prisma.ppid.findUnique({ where: { email } })
    ]);

    if (existingAdmin || existingPemohon || existingPpid) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash('Garut@2025?', 10);

    let newAccount;
    if (role === 'ADMIN') {
      newAccount = await prisma.admin.create({
        data: {
          nama,
          email,
          hashed_password: hashedPassword
        }
      });
    } else if (role === 'PEMOHON') {
      newAccount = await prisma.pemohon.create({
        data: {
          nama,
          email,
          hashed_password: hashedPassword,
          is_approved: true // Admin-created accounts are auto-approved
        }
      });
    } else if (['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(role)) {
      newAccount = await prisma.ppid.create({
        data: {
          nama,
          email,
          hashed_password: hashedPassword,
          role,
          no_pegawai: `PEG${Date.now()}`
        }
      });
    } else {
      return NextResponse.json({ error: 'Role tidak valid untuk kelola akses' }, { status: 400 });
    }

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'CREATE_ACCOUNT',
          details: `Created ${role} account: ${nama} (${email})`,
          user_id: decoded.id,
          user_role: decoded.role,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Akun berhasil dibuat',
      data: {
        id: newAccount.id,
        nama: newAccount.nama,
        email: newAccount.email,
        role
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}