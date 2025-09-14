import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  email: string;
  id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check for authentication token
    const authHeader = request.headers.get('authorization');
    let pemohonId = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        
        // Find pemohon by email from token
        const pemohon = await prisma.pemohon.findUnique({
          where: { email: decoded.email }
        });
        
        if (pemohon) {
          pemohonId = pemohon.id;
        }
      } catch {
        console.log('Token verification failed, using default pemohon');
      }
    }
    
    // Fallback to first available pemohon if no auth or auth failed
    if (!pemohonId) {
      const pemohon = await prisma.pemohon.findFirst();
      pemohonId = pemohon?.id || 1;
    }

    const newRequest = await prisma.request.create({
      data: {
        pemohon_id: pemohonId,
        rincian_informasi: body.rincian_informasi || 'Default info',
        tujuan_penggunaan: body.tujuan_penggunaan || 'Default purpose',
        cara_memperoleh_informasi: body.cara_memperoleh_informasi || 'Email',
        cara_mendapat_salinan: body.cara_mendapat_salinan || 'Email',
        file_attachments: body.file_attachments || null,
        status: 'Diajukan'
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Request submitted via Prisma',
      data: newRequest
    });

  } catch (error: unknown) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}