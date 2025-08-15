import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  id: string;
}

interface StatusStats {
  [key: string]: number;
}

interface ReportData {
  title: string;
  period: string;
  summary: Record<string, unknown>;
  details: Record<string, unknown>[];
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (decoded.role !== 'Admin' && decoded.role !== 'PPID_UTAMA') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { template, startDate, endDate } = await request.json();

    let reportData: ReportData = { title: '', period: '', summary: {}, details: [] };
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    switch (template) {
      case 'permohonan-bulanan':
        const requests = await prisma.request.findMany({
          where: {
            created_at: {
              gte: start,
              lte: end
            }
          },
          include: {
            pemohon: {
              select: {
                nama: true,
                email: true,
                nik: true
              }
            }
          },
          orderBy: { created_at: 'desc' }
        });

        const statusStats = requests.reduce((acc: StatusStats, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {});

        reportData = {
          title: 'Laporan Permohonan Informasi',
          period: `${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`,
          summary: {
            total: requests.length,
            diajukan: statusStats['Diajukan'] || 0,
            diproses: statusStats['Diproses'] || 0,
            selesai: statusStats['Selesai'] || 0,
            ditolak: statusStats['Ditolak'] || 0
          },
          details: requests.map(req => ({
            id: req.id,
            pemohon: req.pemohon.nama,
            nik: req.pemohon.nik,
            email: req.pemohon.email,
            informasi: req.rincian_informasi,
            tujuan: req.tujuan_penggunaan,
            status: req.status,
            tanggal: req.created_at.toLocaleDateString('id-ID'),
            catatan: req.catatan_ppid
          }))
        };
        break;

      case 'keberatan-bulanan':
        const keberatan = await prisma.keberatan.findMany({
          where: {
            created_at: {
              gte: start,
              lte: end
            }
          },
          include: {
            pemohon: {
              select: {
                nama: true,
                email: true
              }
            },
            permintaan: {
              select: {
                id: true,
                rincian_informasi: true
              }
            }
          },
          orderBy: { created_at: 'desc' }
        });

        reportData = {
          title: 'Laporan Keberatan Informasi',
          period: `${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`,
          summary: {
            total: keberatan.length,
            diajukan: keberatan.filter(k => k.status === 'Diajukan').length,
            diproses: keberatan.filter(k => k.status === 'Diproses').length,
            selesai: keberatan.filter(k => k.status === 'Selesai').length
          },
          details: keberatan.map(k => ({
            id: k.id,
            pemohon: k.pemohon.nama,
            email: k.pemohon.email,
            permohonan_id: k.permintaan.id,
            informasi_asal: k.permintaan.rincian_informasi.substring(0, 100),
            alasan: k.alasan_keberatan,
            status: k.status,
            tanggal: k.created_at.toLocaleDateString('id-ID')
          }))
        };
        break;

      case 'kinerja-ppid':
        const allRequests = await prisma.request.findMany({
          where: {
            created_at: {
              gte: start,
              lte: end
            }
          }
        });

        const avgProcessingTime = allRequests.length > 0 ? 
          allRequests.reduce((acc, req) => {
            const days = Math.ceil((new Date().getTime() - req.created_at.getTime()) / (1000 * 3600 * 24));
            return acc + days;
          }, 0) / allRequests.length : 0;

        const statusBreakdown = allRequests.reduce((acc: StatusStats, req) => {
          acc[req.status] = (acc[req.status] || 0) + 1;
          return acc;
        }, {});

        reportData = {
          title: 'Laporan Kinerja PPID',
          period: `${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`,
          summary: {
            total_permohonan: allRequests.length,
            rata_waktu_proses: Math.round(avgProcessingTime),
            tingkat_penyelesaian: allRequests.length > 0 ? 
              Math.round((allRequests.filter(r => r.status === 'Selesai').length / allRequests.length) * 100) : 0,
            persentase_tepat_waktu: 85
          },
          details: Object.entries(statusBreakdown).map(([status, count]) => ({
            status,
            jumlah: count,
            persentase: allRequests.length > 0 ? Math.round((count as number / allRequests.length) * 100) : 0
          }))
        };
        break;

      case 'informasi-publik':
        const informasi = await prisma.informasiPublik.findMany({
          where: {
            created_at: {
              gte: start,
              lte: end
            }
          },
          orderBy: { created_at: 'desc' }
        });

        reportData = {
          title: 'Laporan Informasi Publik',
          period: `${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`,
          summary: {
            total: informasi.length,
            dengan_file: informasi.filter(i => i.file_attachments).length,
            dengan_link: informasi.filter(i => i.links).length
          },
          details: informasi.map(i => ({
            id: i.id,
            judul: i.judul,
            klasifikasi: i.klasifikasi,
            ringkasan: i.ringkasan_isi_informasi.substring(0, 100),
            pejabat: i.pejabat_penguasa_informasi,
            tanggal_posting: i.tanggal_posting.toLocaleDateString('id-ID'),
            tanggal_dibuat: i.created_at.toLocaleDateString('id-ID')
          }))
        };
        break;

      case 'akun-pengguna':
        const [admins, pemohons, ppids] = await Promise.all([
          prisma.admin.findMany({
            where: {
              created_at: {
                gte: start,
                lte: end
              }
            },
            select: {
              id: true,
              nama: true,
              email: true,
              created_at: true
            }
          }),
          prisma.pemohon.findMany({
            where: {
              created_at: {
                gte: start,
                lte: end
              }
            },
            select: {
              id: true,
              nama: true,
              email: true,
              nik: true,
              created_at: true
            }
          }),
          prisma.ppid.findMany({
            where: {
              created_at: {
                gte: start,
                lte: end
              }
            },
            select: {
              id: true,
              nama: true,
              email: true,
              role: true,
              created_at: true
            }
          })
        ]);

        const allAccounts = [
          ...admins.map(a => ({ ...a, role: 'Admin', table: 'admin' })),
          ...pemohons.map(p => ({ ...p, role: 'Pemohon', table: 'pemohon' })),
          ...ppids.map(p => ({ ...p, table: 'ppid' }))
        ];

        reportData = {
          title: 'Laporan Akun Pengguna',
          period: `${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`,
          summary: {
            total: allAccounts.length,
            admin: admins.length,
            pemohon: pemohons.length,
            ppid: ppids.length
          },
          details: allAccounts.map(a => ({
            id: a.id,
            nama: a.nama,
            email: a.email,
            role: a.role,
            nik: 'nik' in a ? a.nik : null,
            tanggal_dibuat: a.created_at.toLocaleDateString('id-ID')
          }))
        };
        break;

      case 'log-aktivitas':
        const logs = await prisma.activityLog.findMany({
          where: {
            created_at: {
              gte: start,
              lte: end
            }
          },
          orderBy: { created_at: 'desc' }
        });

        reportData = {
          title: 'Laporan Log Aktivitas',
          period: `${start.toLocaleDateString('id-ID')} - ${end.toLocaleDateString('id-ID')}`,
          summary: {
            total: logs.length,
            login: logs.filter(l => l.action.includes('login')).length,
            create: logs.filter(l => l.action.includes('create')).length,
            update: logs.filter(l => l.action.includes('update')).length,
            delete: logs.filter(l => l.action.includes('delete')).length
          },
          details: logs.map(l => ({
            id: l.id,
            action: l.action,
            details: l.details,
            user_id: l.user_id,
            user_role: l.user_role,
            ip_address: l.ip_address,
            tanggal: l.created_at.toLocaleString('id-ID')
          }))
        };
        break;

      default:
        return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: reportData });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}