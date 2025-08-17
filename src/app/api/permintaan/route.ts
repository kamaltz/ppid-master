import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

interface WhereClause {
  pemohon_id?: number;
  status?: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');

    // Filter based on user role
    const where: WhereClause = {};
    const userId = parseInt(decoded.id) || decoded.userId;
    
    // Pemohon only sees their own requests
    if (decoded.role === 'Pemohon') {
      where.pemohon_id = userId;
    }
    // PPID Pelaksana only sees requests assigned to them
    else if (decoded.role === 'PPID_PELAKSANA') {
      where.assigned_to = userId;
    }
    
    // Apply status filter if provided
    if (status) {
      where.status = status;
    }
    
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.permintaan.findMany({
        where,
        include: {
          pemohon: {
            select: { id: true, nama: true, email: true, nik: true, no_telepon: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.permintaan.count({ where })
    ]);

    console.log('API Response sample:', requests && requests.length > 0 ? requests[0] : 'No requests found');

    return NextResponse.json({ 
      success: true,
      data: requests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get permintaan error:', error);
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
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only pemohon can create requests
    if (decoded.role !== 'Pemohon') {
      return NextResponse.json({ error: 'Only pemohon can create requests' }, { status: 403 });
    }

    const { judul, deskripsi, rincian_informasi, tujuan_penggunaan, cara_memperoleh_informasi, cara_mendapat_salinan, kategori_id, cara_memperoleh } = await request.json();

    // Validate required fields
    if (!rincian_informasi || !tujuan_penggunaan) {
      return NextResponse.json({ error: 'Rincian informasi dan tujuan penggunaan wajib diisi' }, { status: 400 });
    }

    const userId = parseInt(decoded.id) || decoded.userId;

    const newRequest = await prisma.permintaan.create({
      data: {
        pemohon_id: userId,
        judul: judul || 'Permintaan Informasi',
        rincian_informasi,
        tujuan_penggunaan,
        cara_memperoleh_informasi: cara_memperoleh_informasi || cara_memperoleh || 'Email',
        cara_mendapat_salinan: cara_mendapat_salinan || 'Email',
        kategori_id: kategori_id || null,
        status: 'Diajukan'
      }
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'CREATE_REQUEST',
          details: `Created request: ${newRequest?.judul || 'Unknown'}`,
          user_id: userId.toString(),
          user_role: decoded.role,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    return NextResponse.json({ success: true, message: 'Permintaan berhasil dibuat', data: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Create permintaan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}