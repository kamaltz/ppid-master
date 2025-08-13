import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';

export async function POST() {
  try {
    // Get or create a pemohon
    let pemohon = await prisma.pemohon.findFirst();
    
    if (!pemohon) {
      pemohon = await prisma.pemohon.create({
        data: {
          email: 'test@example.com',
          hashed_password: 'test',
          nama: 'Test User',
          nik: '1234567890123456',
          no_telepon: '081234567890'
        }
      });
    }
    
    // Create test request with file attachments
    const testRequest = await prisma.request.create({
      data: {
        pemohon_id: pemohon.id,
        rincian_informasi: 'Test permintaan informasi dari API dengan file attachment',
        tujuan_penggunaan: 'Test purpose untuk pengujian',
        cara_memperoleh_informasi: 'Email',
        cara_mendapat_salinan: 'Email',
        status: 'Diajukan',
        file_attachments: JSON.stringify(['dokumen1.pdf', 'lampiran.docx', 'foto_ktp.jpg'])
      }
    });
    
    console.log('Created test request:', testRequest);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...testRequest,
        created_at: testRequest.created_at.toISOString(),
        updated_at: testRequest.updated_at.toISOString()
      }
    });
    
  } catch (error: any) {
    console.error('Test insert error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}