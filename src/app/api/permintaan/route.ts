import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';
import { checkDailyRequestLimit } from '@/lib/dailyLimits';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

interface ActivityLog {
  id: number;
  action: string;
  level: string;
  message: string;
  user_id?: string;
  user_role?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  resource_id?: string;
  resource_type?: string;
  details?: string | object | null;
  created_at: string;
}

declare global {
  var activityLogs: ActivityLog[] | undefined;
}

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const xClientIP = request.headers.get('x-client-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (xRealIP) return xRealIP;
  if (xClientIP) return xClientIP;
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  
  return '127.0.0.1';
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

    // Log activity to global logs
    try {
      global.activityLogs = global.activityLogs || [];
      global.activityLogs.unshift({
        id: Date.now(),
        action: 'CREATE_PERMOHONAN',
        level: 'INFO',
        message: `Permohonan baru dibuat: ${newRequest.judul}`,
        user_id: userId.toString(),
        user_role: decoded.role,
        resource_id: newRequest.id.toString(),
        resource_type: 'PERMOHONAN',
        ip_address: getClientIP(request),
        user_agent: request.headers.get('user-agent') || 'Unknown',
        details: { judul: newRequest.judul, status: 'Diajukan' },
        created_at: new Date().toISOString()
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