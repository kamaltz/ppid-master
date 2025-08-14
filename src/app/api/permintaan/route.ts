import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Remove duplicate token verification since it's already done above

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const status = searchParams.get('status');

    // Filter based on user role
    let where: any = {};
    
    // Pemohon only sees their own requests
    if (decoded.role === 'Pemohon') {
      where.pemohon_id = decoded.userId;
    }
    // PPID Pelaksana only sees requests that are being processed
    else if (decoded.role === 'PPID_PELAKSANA') {
      where.status = 'Diproses';
    }
    
    // Apply status filter if provided
    if (status) {
      where.status = status;
    }
    
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.request.count({ where })
    ]);

    // Get all unique pemohon IDs
    const pemohonIds = [...new Set(requests.map(r => r.pemohon_id).filter(Boolean))];
    
    // Fetch all pemohon data in one query
    const pemohons = await prisma.pemohon.findMany({
      where: { id: { in: pemohonIds } },
      select: { id: true, nama: true, email: true, nik: true, no_telepon: true }
    });
    
    // Create a map for quick lookup
    const pemohonMap = new Map(pemohons.map(p => [p.id, p]));
    
    // Join the data
    const requestsWithPemohon = requests.map(request => ({
      ...request,
      created_at: request.created_at.toISOString(), // Ensure proper ISO string format
      updated_at: request.updated_at.toISOString(),
      pemohon: pemohonMap.get(request.pemohon_id) || { nama: 'Unknown', email: 'Unknown', nik: null }
    }));

    console.log('API Response sample:', requestsWithPemohon[0]);

    return NextResponse.json({ 
      data: requestsWithPemohon,
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const { rincian_informasi, tujuan_penggunaan, cara_memperoleh_informasi, cara_mendapat_salinan } = await request.json();

    if (!rincian_informasi || !tujuan_penggunaan) {
      return NextResponse.json({ error: 'Rincian informasi dan tujuan penggunaan wajib diisi' }, { status: 400 });
    }

    const newRequest = await prisma.request.create({
      data: {
        pemohon_id: decoded.userId,
        rincian_informasi,
        tujuan_penggunaan,
        cara_memperoleh_informasi: cara_memperoleh_informasi || 'Email',
        cara_mendapat_salinan: cara_mendapat_salinan || 'Email'
      }
    });

    return NextResponse.json({ message: 'Permintaan berhasil dibuat', data: newRequest });
  } catch (error) {
    console.error('Create permintaan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}