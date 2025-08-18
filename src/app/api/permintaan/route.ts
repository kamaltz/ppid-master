import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';
import { checkDailyRequestLimit } from '@/lib/dailyLimits';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
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
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');

    // Filter based on user role
    const where: Record<string, unknown> = {};
    const userId = parseInt(decoded.id) || decoded.userId;
    
    // Role-based filtering
    if (decoded.role === 'PEMOHON') {
      where.pemohon_id = userId;
    } else if (decoded.role === 'PPID_PELAKSANA') {
      // PPID Pelaksana only sees requests assigned to them
      where.assigned_ppid_id = userId;
    } else if (decoded.role === 'PPID_UTAMA') {
      // PPID Utama sees all requests, or can filter by assignment
      // No additional filter needed
    } else if (decoded.role === 'ADMIN') {
      // Admin sees all requests
      // No additional filter needed
    }
    
    // Apply status filter if provided
    if (status) {
      where.status = status;
    }
    
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          pemohon: {
            select: { id: true, nama: true, email: true, nik: true, no_telepon: true }
          },
          assigned_ppid: {
            select: { id: true, nama: true, role: true }
          },
          _count: {
            select: { responses: true }
          },
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              message: true,
              created_at: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.request.count({ where })
    ]);

    // Transform data to include messageCount and lastMessage
    const transformedRequests = requests.map(request => ({
      ...request,
      messageCount: request._count.responses,
      lastMessage: request.responses[0] || null
    }));

    console.log('API Response sample:', transformedRequests && transformedRequests.length > 0 ? transformedRequests[0] : 'No requests found');

    return NextResponse.json({ 
      success: true,
      data: transformedRequests,
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
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only pemohon can create requests
    if (decoded.role !== 'PEMOHON') {
      return NextResponse.json({ error: 'Only pemohon can create requests' }, { status: 403 });
    }

    const { judul, rincian_informasi, tujuan_penggunaan, cara_memperoleh_informasi, cara_mendapat_salinan, cara_memperoleh } = await request.json();

    // Validate required fields
    if (!rincian_informasi || !tujuan_penggunaan) {
      return NextResponse.json({ error: 'Rincian informasi dan tujuan penggunaan wajib diisi' }, { status: 400 });
    }

    const userId = parseInt(decoded.id) || decoded.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check daily limit
    const limitCheck = await checkDailyRequestLimit(userId);
    if (!limitCheck.canSubmit) {
      return NextResponse.json({ 
        error: `Batas harian tercapai. Anda sudah mengajukan ${limitCheck.count} permohonan hari ini. Maksimal ${limitCheck.limit} permohonan per hari.` 
      }, { status: 429 });
    }

    const newRequest = await prisma.request.create({
      data: {
        pemohon_id: userId,
        judul: judul || 'Permintaan Informasi',
        rincian_informasi,
        tujuan_penggunaan,
        cara_memperoleh_informasi: cara_memperoleh_informasi || cara_memperoleh || 'Email',
        cara_mendapat_salinan: cara_mendapat_salinan || 'Email',
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