import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newRequest = await prisma.request.create({
      data: {
        pemohon_id: 1,
        rincian_informasi: body.rincian_informasi || 'Default info',
        tujuan_penggunaan: body.tujuan_penggunaan || 'Default purpose',
        cara_memperoleh_informasi: body.cara_memperoleh_informasi || 'Email',
        cara_mendapat_salinan: body.cara_mendapat_salinan || 'Email',
        status: 'Diajukan'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Request submitted via Prisma',
      data: newRequest
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}