import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';
import { checkRateLimit } from '@/lib/apiRateLimit';

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
    
    // Rate limiting - max 5 requests per minute per user
    const userId = decoded.userId || parseInt(decoded.id || '0');
    if (!checkRateLimit(`chat-unread-${userId}`, 5, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    const userRole = decoded.role;
    let unreadCount = 0;
    
    if (['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(userRole)) {
      let requestWhere: any = {};
      let keberatanWhere: any = {};
      
      if (userRole === 'PPID_PELAKSANA') {
        // PPID Pelaksana sees requests assigned to them
        requestWhere = {
          assigned_ppid_id: userId,
          responses: { some: {} }
        };
        keberatanWhere = {
          assigned_ppid_id: userId,
          responses: { some: {} }
        };
      } else {
        // Admin, PPID Utama, Atasan PPID see chats they participated in
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
      
      // Debug logging
      console.log(`[DEBUG] PPID_PELAKSANA ${userId} - Found ${requestsWithNewMessages.length} requests with messages`);
      requestsWithNewMessages.forEach(req => {
        const lastRole = req.responses[0]?.user_role;
        console.log(`[DEBUG] Request ${req.id}: last message from '${lastRole}'`);
      });
      
      // Count chats where last message is from pemohon (indicating unread)
      unreadCount = requestsWithNewMessages.filter(req => {
        const lastRole = req.responses[0]?.user_role;
        const isPemohon = lastRole && (lastRole.toUpperCase() === 'PEMOHON' || lastRole === 'Pemohon');
        if (isPemohon) {
          console.log(`[DEBUG] Request ${req.id} marked as unread - last role: '${lastRole}'`);
        }
        return isPemohon;
      }).length + keberatanWithNewMessages.filter(keb => {
        const lastRole = keb.responses[0]?.user_role;
        return lastRole && (lastRole.toUpperCase() === 'PEMOHON' || lastRole === 'Pemohon');
      }).length;
      
      console.log(`[DEBUG] Final unread count for PPID_PELAKSANA ${userId}: ${unreadCount}`);
      
    } else if (userRole === 'Pemohon' || userRole === 'PEMOHON') {
      // For pemohon, count chats where last message is from PPID/Admin (indicating unread)
      const requestsWithNewMessages = await prisma.request.findMany({
        where: { pemohon_id: userId },
        include: {
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      
      const keberatanWithNewMessages = await prisma.keberatan.findMany({
        where: { pemohon_id: userId },
        include: {
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      
      // Count chats where last message is from PPID/Admin (indicating unread)
      unreadCount = requestsWithNewMessages.filter(req => 
        req.responses[0] && req.responses[0].user_role && 
        ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(req.responses[0].user_role.toUpperCase())
      ).length + keberatanWithNewMessages.filter(keb => 
        keb.responses[0] && keb.responses[0].user_role && 
        ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(keb.responses[0].user_role.toUpperCase())
      ).length;
    }

    return NextResponse.json({
      success: true,
      count: unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread chats:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}