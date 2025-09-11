import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id?: string;
  userId?: number;
  role: string;
  nama?: string;
  email?: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const userId = decoded.userId || parseInt(decoded.id || '0');
    const userRole = decoded.role;

    // Get chats where user has participated (sent messages)
    let chats = [];

    if (['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(userRole)) {
      // Build where condition based on role
      let requestWhere: any = {};
      let keberatanWhere: any = {};
      
      if (userRole === 'ADMIN' || userRole === 'PPID_UTAMA') {
        // Admin and PPID Utama see all forwarded requests/keberatan
        requestWhere = {
          status: { in: ['Diteruskan', 'Diproses', 'Ditanggapi', 'Selesai'] }
        };
        keberatanWhere = {
          status: { in: ['Diteruskan', 'Diproses', 'Ditanggapi', 'Selesai'] }
        };
      } else if (userRole === 'PPID_PELAKSANA') {
        // PPID Pelaksana sees requests/keberatan assigned to them or unassigned forwarded ones
        requestWhere = {
          OR: [
            { assigned_ppid_id: userId },
            {
              AND: [
                { status: { in: ['Diteruskan', 'Diproses'] } },
                { assigned_ppid_id: null }
              ]
            }
          ]
        };
        keberatanWhere = {
          OR: [
            { assigned_ppid_id: userId },
            {
              AND: [
                { status: { in: ['Diteruskan', 'Diproses'] } },
                { assigned_ppid_id: null }
              ]
            }
          ]
        };
      } else if (userRole === 'ATASAN_PPID') {
        // Atasan PPID sees all forwarded requests for oversight
        requestWhere = {
          status: { in: ['Diteruskan', 'Diproses', 'Ditanggapi', 'Selesai'] }
        };
        keberatanWhere = {
          status: { in: ['Diteruskan', 'Diproses', 'Ditanggapi', 'Selesai'] }
        };
      }

      const requestChats = await prisma.request.findMany({
        where: requestWhere,
        include: {
          pemohon: {
            select: { nama: true, email: true }
          },
          assigned_ppid: {
            select: { nama: true, id: true }
          },
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              message: true,
              created_at: true,
              user_role: true,
              user_name: true
            }
          }
        },
        orderBy: { updated_at: 'desc' }
      });

      const keberatanChats = await prisma.keberatan.findMany({
        where: keberatanWhere,
        include: {
          pemohon: {
            select: { nama: true, email: true }
          },
          assigned_ppid: {
            select: { nama: true, id: true }
          },
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              message: true,
              created_at: true,
              user_role: true,
              user_name: true
            }
          }
        },
        orderBy: { updated_at: 'desc' }
      });

      // Format request chats
      const formattedRequestChats = requestChats.map(req => ({
        id: req.id,
        type: 'request' as const,
        title: `Permohonan #${req.id}`,
        subtitle: (req.rincian_informasi || '').substring(0, 50) + '...',
        pemohon: req.pemohon?.nama || 'Unknown',
        email: req.pemohon?.email || '',
        status: req.status,
        lastMessage: req.responses[0]?.message || 'Belum ada pesan',
        lastMessageTime: req.responses[0]?.created_at || req.created_at,
        lastMessageFrom: req.responses[0]?.user_name || 'System',
        url: `/admin/permohonan/${req.id}`,
        assignedPpid: req.assigned_ppid?.nama,
        isAssignedToMe: req.assigned_ppid?.id === userId
      }));

      // Format keberatan chats
      const formattedKeberatanChats = keberatanChats.map(keb => ({
        id: keb.id,
        type: 'keberatan' as const,
        title: `Keberatan #${keb.id}`,
        subtitle: (keb.alasan_keberatan || '').substring(0, 50) + '...',
        pemohon: keb.pemohon?.nama || 'Unknown',
        email: keb.pemohon?.email || '',
        status: keb.status,
        lastMessage: keb.responses[0]?.message || 'Belum ada pesan',
        lastMessageTime: keb.responses[0]?.created_at || keb.created_at,
        lastMessageFrom: keb.responses[0]?.user_name || 'System',
        url: `/admin/keberatan/${keb.id}`,
        assignedPpid: keb.assigned_ppid?.nama,
        isAssignedToMe: keb.assigned_ppid?.id === userId
      }));

      chats = [...formattedRequestChats, ...formattedKeberatanChats]
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    } else if (userRole === 'PEMOHON') {
      // For pemohon, get ALL their requests and keberatan (not just those with responses)
      const requestChats = await prisma.request.findMany({
        where: { pemohon_id: userId },
        include: {
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              message: true,
              created_at: true,
              user_role: true,
              user_name: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      const keberatanChats = await prisma.keberatan.findMany({
        where: { pemohon_id: userId },
        include: {
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              message: true,
              created_at: true,
              user_role: true,
              user_name: true
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      // Format request chats - show ALL requests
      const formattedRequestChats = requestChats.map(req => ({
        id: req.id,
        type: 'request' as const,
        title: `Permohonan #${req.id}`,
        subtitle: (req.rincian_informasi || '').substring(0, 50) + '...',
        status: req.status,
        lastMessage: req.responses[0]?.message || (req.status === 'Diajukan' ? 'Permohonan telah diajukan, menunggu respon PPID' : 'Belum ada pesan'),
        lastMessageTime: req.responses[0]?.created_at || req.created_at,
        lastMessageFrom: req.responses[0]?.user_name || 'System',
        url: `/pemohon/permohonan/${req.id}`
      }));

      // Format keberatan chats - show ALL keberatan
      const formattedKeberatanChats = keberatanChats.map(keb => ({
        id: keb.id,
        type: 'keberatan' as const,
        title: `Keberatan #${keb.id}`,
        subtitle: (keb.alasan_keberatan || '').substring(0, 50) + '...',
        status: keb.status,
        lastMessage: keb.responses[0]?.message || (keb.status === 'Diajukan' ? 'Keberatan telah diajukan, menunggu respon PPID' : 'Belum ada pesan'),
        lastMessageTime: keb.responses[0]?.created_at || keb.created_at,
        lastMessageFrom: keb.responses[0]?.user_name || 'System',
        url: `/pemohon/keberatan/${keb.id}`
      }));

      chats = [...formattedRequestChats, ...formattedKeberatanChats]
        .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    }

    return NextResponse.json({ 
      success: true, 
      data: chats 
    });
  } catch (error) {
    console.error('Get chat list error:', error);
    console.error('Error details:', error instanceof Error ? error.stack : error);
    return NextResponse.json({ 
      success: true,
      data: [] // Return empty array instead of error to prevent UI crash
    });
  }
}