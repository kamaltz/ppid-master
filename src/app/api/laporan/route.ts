import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    if (!['Admin', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { template, startDate, endDate } = await request.json();
    
    let reportData;
    const period = startDate && endDate ? `${startDate} s/d ${endDate}` : 'Semua data';

    switch (template) {
      case 'permohonan-bulanan':
        reportData = await generatePermohonanReport(startDate, endDate);
        break;
      case 'keberatan-bulanan':
        reportData = await generateKeberatanReport(startDate, endDate);
        break;
      case 'kinerja-ppid':
        reportData = await generateKinerjaReport(startDate, endDate);
        break;
      case 'informasi-publik':
        reportData = await generateInformasiReport();
        break;
      case 'akun-pengguna':
        reportData = await generateAkunReport();
        break;
      case 'log-aktivitas':
        reportData = await generateLogReport(startDate, endDate);
        break;
      default:
        return NextResponse.json({ error: 'Invalid template' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...reportData,
        period
      }
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

async function generatePermohonanReport(startDate?: string, endDate?: string) {
  const whereClause = startDate && endDate ? {
    created_at: {
      gte: new Date(startDate),
      lte: new Date(endDate + 'T23:59:59.999Z')
    }
  } : {};

  const requests = await prisma.request.findMany({
    where: whereClause,
    include: {
      pemohon: {
        select: { nama: true, email: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  const summary = {
    'Total Permohonan': requests.length,
    'Diajukan': requests.filter(r => r.status === 'Diajukan').length,
    'Diproses': requests.filter(r => r.status === 'Diproses').length,
    'Selesai': requests.filter(r => r.status === 'Selesai').length,
    'Ditolak': requests.filter(r => r.status === 'Ditolak').length
  };

  const details = requests.map(r => ({
    ID: r.id,
    Pemohon: r.pemohon?.nama || 'N/A',
    Email: r.pemohon?.email || 'N/A',
    'Rincian Informasi': r.rincian_informasi,
    Status: r.status,
    'Tanggal Dibuat': r.created_at.toLocaleDateString('id-ID'),
    'Catatan PPID': r.catatan_ppid || '-'
  }));

  return {
    title: 'Laporan Permohonan Informasi',
    summary,
    details
  };
}

async function generateKeberatanReport(startDate?: string, endDate?: string) {
  const whereClause = startDate && endDate ? {
    created_at: {
      gte: new Date(startDate),
      lte: new Date(endDate + 'T23:59:59.999Z')
    }
  } : {};

  const keberatan = await prisma.keberatan.findMany({
    where: whereClause,
    include: {
      pemohon: {
        select: { nama: true, email: true }
      }
    },
    orderBy: { created_at: 'desc' }
  });

  const summary = {
    'Total Keberatan': keberatan.length,
    'Diproses': keberatan.filter(k => k.status === 'Diproses').length,
    'Selesai': keberatan.filter(k => k.status === 'Selesai').length,
    'Ditolak': keberatan.filter(k => k.status === 'Ditolak').length
  };

  const details = keberatan.map(k => ({
    ID: k.id,
    Pemohon: k.pemohon?.nama || 'N/A',
    Email: k.pemohon?.email || 'N/A',
    'Alasan Keberatan': k.alasan_keberatan,
    Status: k.status,
    'Tanggal Dibuat': k.created_at.toLocaleDateString('id-ID')
  }));

  return {
    title: 'Laporan Keberatan',
    summary,
    details
  };
}

async function generateKinerjaReport(startDate?: string, endDate?: string) {
  const whereClause = startDate && endDate ? {
    created_at: {
      gte: new Date(startDate),
      lte: new Date(endDate + 'T23:59:59.999Z')
    }
  } : {};

  const requests = await prisma.request.findMany({
    where: whereClause
  });

  const totalRequests = requests.length;
  const completedRequests = requests.filter(r => r.status === 'Selesai').length;
  const rejectedRequests = requests.filter(r => r.status === 'Ditolak').length;
  const processingRequests = requests.filter(r => r.status === 'Diproses').length;

  const completionRate = totalRequests > 0 ? ((completedRequests / totalRequests) * 100).toFixed(2) : '0';
  const rejectionRate = totalRequests > 0 ? ((rejectedRequests / totalRequests) * 100).toFixed(2) : '0';

  const summary = {
    'Total Permohonan': totalRequests,
    'Tingkat Penyelesaian': `${completionRate}%`,
    'Tingkat Penolakan': `${rejectionRate}%`,
    'Sedang Diproses': processingRequests
  };

  return {
    title: 'Laporan Kinerja PPID',
    summary,
    details: []
  };
}

async function generateInformasiReport() {
  const informasi = await prisma.informasiPublik.findMany({
    orderBy: { created_at: 'desc' }
  });

  const summary = {
    'Total Informasi': informasi.length,
    'Informasi Berkala': informasi.filter(i => i.klasifikasi === 'Berkala').length,
    'Informasi Serta Merta': informasi.filter(i => i.klasifikasi === 'Serta Merta').length,
    'Informasi Setiap Saat': informasi.filter(i => i.klasifikasi === 'Setiap Saat').length
  };

  const details = informasi.map(i => ({
    ID: i.id,
    Judul: i.judul,
    Klasifikasi: i.klasifikasi,
    'Tanggal Dibuat': i.created_at.toLocaleDateString('id-ID'),
    'Tanggal Update': i.updated_at.toLocaleDateString('id-ID')
  }));

  return {
    title: 'Laporan Informasi Publik',
    summary,
    details
  };
}

async function generateAkunReport() {
  const [pemohon, admin, ppid] = await Promise.all([
    prisma.pemohon.findMany(),
    prisma.admin.findMany(),
    prisma.ppid.findMany()
  ]);

  const summary = {
    'Total Pemohon': pemohon.length,
    'Total Admin': admin.length,
    'Total PPID': ppid.length,
    'Total Pengguna': pemohon.length + admin.length + ppid.length
  };

  const details = [
    ...pemohon.map(p => ({
      ID: p.id,
      Nama: p.nama,
      Email: p.email,
      Role: 'Pemohon',
      'Tanggal Daftar': p.created_at.toLocaleDateString('id-ID')
    })),
    ...admin.map(a => ({
      ID: a.id,
      Nama: a.nama,
      Email: a.email,
      Role: 'Admin',
      'Tanggal Daftar': a.created_at.toLocaleDateString('id-ID')
    })),
    ...ppid.map(p => ({
      ID: p.id,
      Nama: p.nama,
      Email: p.email,
      Role: 'PPID',
      'Tanggal Daftar': p.created_at.toLocaleDateString('id-ID')
    }))
  ];

  return {
    title: 'Laporan Akun Pengguna',
    summary,
    details
  };
}

async function generateLogReport(startDate?: string, endDate?: string) {
  const whereClause = startDate && endDate ? {
    created_at: {
      gte: new Date(startDate),
      lte: new Date(endDate + 'T23:59:59.999Z')
    }
  } : {};

  const logs = await prisma.activityLog.findMany({
    where: whereClause,
    orderBy: { created_at: 'desc' },
    take: 1000 // Limit to prevent large exports
  });

  const summary = {
    'Total Log': logs.length,
    'Login': logs.filter(l => l.action === 'LOGIN').length,
    'Create': logs.filter(l => l.action === 'CREATE').length,
    'Update': logs.filter(l => l.action === 'UPDATE').length,
    'Delete': logs.filter(l => l.action === 'DELETE').length
  };

  const details = logs.map(l => ({
    ID: l.id,
    'User ID': l.user_id,
    'User Role': l.user_role,
    Action: l.action,
    Resource: l.resource,
    Details: l.details || '-',
    'IP Address': l.ip_address || '-',
    'User Agent': l.user_agent || '-',
    Timestamp: l.created_at.toLocaleString('id-ID')
  }));

  return {
    title: 'Laporan Log Aktivitas',
    summary,
    details
  };
}