import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const keberatan = await prisma.keberatan.findUnique({
      where: { id },
      include: {
        pemohon: {
          select: {
            nama: true,
            email: true,
            nik: true,
            no_telepon: true,
            alamat: true
          }
        },
        permintaan: {
          select: {
            id: true,
            rincian_informasi: true
          }
        }
      }
    });

    if (!keberatan) {
      return NextResponse.json({ error: 'Keberatan not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: keberatan 
    });
  } catch (error) {
    console.error('Get keberatan detail error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const { status, catatan_ppid } = await request.json();

    const updatedKeberatan = await prisma.keberatan.update({
      where: { id },
      data: {
        status,
        catatan_ppid,
        updated_at: new Date()
      }
    });

    // Add system message when status changes
    if (status === 'Selesai') {
      try {
        await prisma.keberatanResponse.create({
          data: {
            keberatan_id: id,
            user_id: '0',
            user_role: 'System',
            user_name: 'System',
            message: '✅ Keberatan telah Selesai. Chat ditutup.\n\n📋 PENTING: Pemohon WAJIB melampirkan bukti hasil penggunaan informasi dalam waktu 30 hari setelah keberatan selesai. Bukti dapat berupa:\n• Hasil penelitian/skripsi/tesis (untuk keperluan akademik)\n• Dokumen administrasi yang telah diproses (untuk keperluan administrasi)\n• Laporan riset/analisis (untuk keperluan industri/bisnis)\n• Dokumentasi lainnya sesuai tujuan penggunaan\n\nSilakan kirim bukti melalui email ke ppid@garutkab.go.id dengan subjek "Bukti Penggunaan Informasi - ID Keberatan #' + id + '"',
            message_type: 'system'
          }
        });
      } catch (msgError) {
        console.warn('Failed to create system message:', msgError);
      }
    } else if (status === 'Ditolak' && catatan_ppid) {
      try {
        await prisma.keberatanResponse.create({
          data: {
            keberatan_id: id,
            user_id: '0',
            user_role: 'System',
            user_name: 'System',
            message: `Keberatan Ditolak. Alasan: ${catatan_ppid}`,
            message_type: 'system'
          }
        });
      } catch (msgError) {
        console.error('Failed to create rejection message:', msgError);
      }
    }

    return NextResponse.json({ success: true, data: updatedKeberatan });
  } catch (error) {
    console.error('Update keberatan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}