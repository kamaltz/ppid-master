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
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const { id } = await params;

    const requestData = await prisma.request.findUnique({
      where: { id: parseInt(id) },
      include: {
        pemohon: {
          select: { nama: true, email: true, nik: true, no_telepon: true, alamat: true }
        }
      }
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: requestData });
  } catch (error) {
    console.error('Get request error:', error);
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
    const { id } = await params;
    const { status, catatan_ppid } = await request.json();
    console.log('API received:', { status, catatan_ppid });

    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(id) },
      data: {
        status,
        catatan_ppid,
        updated_at: new Date()
      }
    });

    // Add system message when status changes
    if (status === 'Selesai') {
      try {
        await prisma.requestResponse.create({
          data: {
            request_id: parseInt(id),
            user_id: '0',
            user_role: 'System',
            user_name: 'System',
            message: '✅ Permohonan telah Selesai. Chat ditutup.\n\n📋 PENTING: Pemohon WAJIB melampirkan bukti hasil penggunaan informasi dalam waktu 30 hari setelah permohonan selesai. Bukti dapat berupa:\n• Hasil penelitian/skripsi/tesis (untuk keperluan akademik)\n• Dokumen administrasi yang telah diproses (untuk keperluan administrasi)\n• Laporan riset/analisis (untuk keperluan industri/bisnis)\n• Dokumentasi lainnya sesuai tujuan penggunaan\n\nSilakan kirim bukti melalui email ke ppid@garutkab.go.id dengan subjek "Bukti Penggunaan Informasi - ID Permohonan #' + id + '"',
            message_type: 'system'
          }
        });
      } catch (msgError) {
        console.warn('Failed to create system message:', msgError);
      }
    } else if (status === 'Ditolak' && catatan_ppid) {
      try {
        console.log('Creating rejection message:', catatan_ppid);
        await prisma.requestResponse.create({
          data: {
            request_id: parseInt(id),
            user_id: '0',
            user_role: 'System',
            user_name: 'System',
            message: `Permohonan Ditolak. Alasan: ${catatan_ppid}`,
            message_type: 'system'
          }
        });
        console.log('Rejection message created successfully');
      } catch (msgError) {
        console.error('Failed to create rejection message:', msgError);
      }
    }

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error('Update request error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const { id } = await params;

    // Check if request exists and belongs to user (for PEMOHON role)
    const existingRequest = await prisma.request.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Only allow deletion if request is still in 'Diajukan' status
    if (existingRequest.status !== 'Diajukan') {
      return NextResponse.json({ error: 'Cannot withdraw request that is already being processed' }, { status: 400 });
    }

    // Delete related responses first
    await prisma.requestResponse.deleteMany({
      where: { request_id: parseInt(id) }
    });

    // Delete the request
    await prisma.request.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true, message: 'Request withdrawn successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}