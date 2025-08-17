import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

interface JWTPayload {
  role: string;
  id: string;
  email: string;
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'File kosong atau format tidak valid' }, { status: 400 });
    }

    // Skip header row
    const dataLines = lines.slice(1);
    const accounts = [];
    const errors = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));
      
      if (columns.length < 3) {
        errors.push(`Baris ${i + 2}: Format tidak lengkap`);
        continue;
      }

      const [nama, email, role] = columns;
      
      if (!nama || !email || !role) {
        errors.push(`Baris ${i + 2}: Data tidak lengkap`);
        continue;
      }

      if (!['ADMIN', 'PEMOHON', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(role)) {
        errors.push(`Baris ${i + 2}: Role tidak valid (${role})`);
        continue;
      }

      accounts.push({ nama, email, role });
    }

    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Terdapat kesalahan dalam file', 
        details: errors 
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash('Garut@2025?', 10);
    let imported = 0;
    const importErrors = [];

    for (const account of accounts) {
      try {
        // Check if email already exists
        const [existingAdmin, existingPemohon, existingPpid] = await Promise.all([
          prisma.admin.findUnique({ where: { email: account.email } }),
          prisma.pemohon.findUnique({ where: { email: account.email } }),
          prisma.ppid.findUnique({ where: { email: account.email } })
        ]);

        if (existingAdmin || existingPemohon || existingPpid) {
          importErrors.push(`Email ${account.email} sudah terdaftar`);
          continue;
        }

        if (account.role === 'ADMIN') {
          await prisma.admin.create({
            data: {
              nama: account.nama,
              email: account.email,
              hashed_password: hashedPassword
            }
          });
        } else if (account.role === 'PEMOHON') {
          await prisma.pemohon.create({
            data: {
              nama: account.nama,
              email: account.email,
              hashed_password: hashedPassword
            }
          });
        } else {
          await prisma.ppid.create({
            data: {
              nama: account.nama,
              email: account.email,
              hashed_password: hashedPassword,
              role: account.role,
              no_pegawai: `PEG${Date.now()}_${imported}`
            }
          });
        }

        imported++;
      } catch (error) {
        importErrors.push(`Gagal membuat akun ${account.email}: ${error}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      imported,
      errors: importErrors.length > 0 ? importErrors : undefined,
      message: `Berhasil mengimpor ${imported} akun${importErrors.length > 0 ? ` (${importErrors.length} gagal)` : ''}`
    });

  } catch (error) {
    console.error('Import accounts error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}