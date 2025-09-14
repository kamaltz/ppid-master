import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
  nama?: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    if (decoded.role !== 'PEMOHON') {
      return NextResponse.json({ error: 'Only pemohon can submit evidence' }, { status: 403 });
    }

    const { request_id, keberatan_id, description, attachments, links } = await request.json();
    
    if (!request_id && !keberatan_id) {
      return NextResponse.json({ error: 'Either request_id or keberatan_id is required' }, { status: 400 });
    }
    
    if (!description || !description.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }
    
    if (!attachments || attachments.length === 0) {
      return NextResponse.json({ error: 'File attachment is required' }, { status: 400 });
    }

    const userId = parseInt(decoded.id) || decoded.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const evidence = await prisma.usageEvidence.create({
      data: {
        request_id: request_id ? parseInt(request_id) : null,
        keberatan_id: keberatan_id ? parseInt(keberatan_id) : null,
        pemohon_id: userId,
        description: description || null,
        attachments: attachments ? JSON.stringify(attachments) : null,
        links: links || null,
        status: 'Submitted'
      }
    });

    // Add system message to chat
    const chatMessage = `📋 Bukti penggunaan informasi telah dikirim oleh pemohon.${description ? `\n\nDeskripsi: ${description}` : ''}`;
    
    if (request_id) {
      await prisma.requestResponse.create({
        data: {
          request_id: parseInt(request_id),
          user_id: userId.toString(),
          user_role: 'PEMOHON',
          user_name: decoded.nama || 'Pemohon',
          message: chatMessage,
          attachments: attachments ? JSON.stringify(attachments) : null,
          message_type: 'evidence'
        }
      });
    } else if (keberatan_id) {
      await prisma.keberatanResponse.create({
        data: {
          keberatan_id: parseInt(keberatan_id),
          user_id: userId.toString(),
          user_role: 'PEMOHON',
          user_name: decoded.nama || 'Pemohon',
          message: chatMessage,
          attachments: attachments ? JSON.stringify(attachments) : null,
          message_type: 'evidence'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Evidence submitted successfully',
      data: evidence 
    }, { status: 201 });
  } catch (error) {
    console.error('Submit evidence error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}