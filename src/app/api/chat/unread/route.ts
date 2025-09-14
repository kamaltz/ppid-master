import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
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
    let unreadCount = 0;
    
    if (['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(userRole)) {
      // For admin and PPID roles, count chats where they have participated and there are new messages from pemohon
      const requestsWithNewMessages = await prisma.request.findMany({
        where: {
          responses: {
            some: {
              user_id: userId.toString(),
              user_role: userRole
            }
          }
        },
        include: {
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      
      const keberatanWithNewMessages = await prisma.keberatan.findMany({
        where: {
          responses: {
            some: {
              user_id: userId.toString(),
              user_role: userRole
            }
          }
        },
        include: {
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1
          }
        }
      });
      
      // Count chats where last message is from pemohon (indicating unread)
      unreadCount = requestsWithNewMessages.filter(req => 
        req.responses[0]?.user_role === 'Pemohon'
      ).length + keberatanWithNewMessages.filter(keb => 
        keb.responses[0]?.user_role === 'Pemohon'
      ).length;
      
    } else if (userRole === 'Pemohon') {
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
        req.responses[0] && ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(req.responses[0].user_role)
      ).length + keberatanWithNewMessages.filter(keb => 
        keb.responses[0] && ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(keb.responses[0].user_role)
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