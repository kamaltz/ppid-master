import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const userId = decoded.userId || parseInt(decoded.id || '0');
    const userRole = decoded.role;
    
    const debug: {
      userId: number;
      userRole: string;
      requests: any[];
      keberatan: any[];
      unreadCount: number;
    } = {
      userId,
      userRole,
      requests: [],
      keberatan: [],
      unreadCount: 0
    };
    
    if (['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(userRole)) {
      let requestWhere: any = {};
      let keberatanWhere: any = {};
      
      if (userRole === 'PPID_PELAKSANA') {
        requestWhere = {
          assigned_ppid_id: userId,
          responses: { some: {} }
        };
        keberatanWhere = {
          assigned_ppid_id: userId,
          responses: { some: {} }
        };
      } else {
        requestWhere = {
          responses: {
            some: {
              user_id: userId.toString(),
              user_role: userRole
            }
          }
        };
        keberatanWhere = {
          responses: {
            some: {
              user_id: userId.toString(),
              user_role: userRole
            }
          }
        };
      }
      
      const requestsWithNewMessages = await prisma.request.findMany({
        where: requestWhere,
        include: {
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      
      const keberatanWithNewMessages = await prisma.keberatan.findMany({
        where: keberatanWhere,
        include: {
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      
      // Debug info
      debug.requests = requestsWithNewMessages.map(req => ({
        id: req.id,
        status: req.status,
        assigned_ppid_id: req.assigned_ppid_id,
        lastMessageRole: req.responses[0]?.user_role,
        lastMessageTime: req.responses[0]?.created_at,
        isPemohon: req.responses[0]?.user_role && (req.responses[0].user_role.toUpperCase() === 'PEMOHON' || req.responses[0].user_role === 'Pemohon')
      }));
      
      debug.keberatan = keberatanWithNewMessages.map(keb => ({
        id: keb.id,
        status: keb.status,
        assigned_ppid_id: keb.assigned_ppid_id,
        lastMessageRole: keb.responses[0]?.user_role,
        lastMessageTime: keb.responses[0]?.created_at,
        isPemohon: keb.responses[0]?.user_role && (keb.responses[0].user_role.toUpperCase() === 'PEMOHON' || keb.responses[0].user_role === 'Pemohon')
      }));
      
      // Count unread
      debug.unreadCount = requestsWithNewMessages.filter(req => {
        const lastRole = req.responses[0]?.user_role;
        return lastRole && (lastRole.toUpperCase() === 'PEMOHON' || lastRole === 'Pemohon');
      }).length + keberatanWithNewMessages.filter(keb => {
        const lastRole = keb.responses[0]?.user_role;
        return lastRole && (lastRole.toUpperCase() === 'PEMOHON' || lastRole === 'Pemohon');
      }).length;
    }

    return NextResponse.json({
      success: true,
      debug
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}