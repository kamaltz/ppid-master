import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create Admin
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@garut.go.id' },
      update: {},
      create: {
        email: 'admin@garut.go.id',
        hashed_password: hashedPassword,
        nama: 'Administrator Sistem'
      }
    });

    // Create PPID Utama
    const ppidUtama = await prisma.ppid.upsert({
      where: { email: 'ppid.utama@garut.go.id' },
      update: {},
      create: {
        no_pegawai: 'PPID001',
        email: 'ppid.utama@garut.go.id',
        hashed_password: hashedPassword,
        nama: 'PPID Utama Diskominfo',
        role: 'PPID_UTAMA'
      }
    });

    // Create PPID Pelaksana
    const ppidPelaksana = await prisma.ppid.upsert({
      where: { email: 'ppid.pelaksana@garut.go.id' },
      update: {},
      create: {
        no_pegawai: 'PPID002',
        email: 'ppid.pelaksana@garut.go.id',
        hashed_password: hashedPassword,
        nama: 'PPID Pelaksana Diskominfo',
        role: 'PPID_PELAKSANA'
      }
    });

    // Create Atasan PPID
    const atasanPpid = await prisma.ppid.upsert({
      where: { email: 'atasan.ppid@garut.go.id' },
      update: {},
      create: {
        no_pegawai: 'PPID003',
        email: 'atasan.ppid@garut.go.id',
        hashed_password: hashedPassword,
        nama: 'Atasan PPID Diskominfo',
        role: 'ATASAN_PPID'
      }
    });

    // Create Pemohon
    const pemohon = await prisma.pemohon.upsert({
      where: { email: 'pemohon@example.com' },
      update: {},
      create: {
        email: 'pemohon@example.com',
        hashed_password: hashedPassword,
        nama: 'Pemohon Test',
        nik: '3205012345678901',
        no_telepon: '081234567890',
        alamat: 'Jl. Test No. 123, Garut'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Default users berhasil dibuat',
      data: {
        admin: { id: admin.id, email: admin.email, nama: admin.nama },
        ppidUtama: { id: ppidUtama.id, email: ppidUtama.email, nama: ppidUtama.nama, role: ppidUtama.role },
        ppidPelaksana: { id: ppidPelaksana.id, email: ppidPelaksana.email, nama: ppidPelaksana.nama, role: ppidPelaksana.role },
        atasanPpid: { id: atasanPpid.id, email: atasanPpid.email, nama: atasanPpid.nama, role: atasanPpid.role },
        pemohon: { id: pemohon.id, email: pemohon.email, nama: pemohon.nama }
      },
      credentials: {
        defaultPassword: defaultPassword,
        accounts: [
          { role: 'Admin', email: 'admin@garut.go.id', password: defaultPassword },
          { role: 'PPID Utama', email: 'ppid.utama@garut.go.id', password: defaultPassword },
          { role: 'PPID Pelaksana', email: 'ppid.pelaksana@garut.go.id', password: defaultPassword },
          { role: 'Atasan PPID', email: 'atasan.ppid@garut.go.id', password: defaultPassword },
          { role: 'Pemohon', email: 'pemohon@example.com', password: defaultPassword }
        ]
      }
    });

  } catch (error: unknown) {
    console.error('Seed users error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}