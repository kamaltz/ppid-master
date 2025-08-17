import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { role: string; id: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      const dirents = await fs.readdir(uploadsDir, { withFileTypes: true });
      const fileDetails = await Promise.all(
        dirents
          .filter(dirent => dirent.isFile())
          .map(async (dirent) => {
            const filePath = path.join(uploadsDir, dirent.name);
            const stats = await fs.stat(filePath);
            const ext = path.extname(dirent.name).toLowerCase();
            
            return {
              name: dirent.name,
              size: stats.size,
              type: ext,
              uploadedAt: stats.birthtime.toISOString(),
              uploader: 'System'
            };
          })
      );

      return NextResponse.json({ success: true, data: fileDetails });
    } catch {
      return NextResponse.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('Media API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { role: string; id: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { filename } = body;
    
    // Validate filename input
    if (!filename || typeof filename !== 'string' || filename.trim() === '') {
      return NextResponse.json({ error: 'Filename is required and must be a valid string' }, { status: 400 });
    }
    
    // Prevent path traversal attacks
    const sanitizedFilename = path.basename(filename);
    if (sanitizedFilename !== filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Invalid filename format' }, { status: 400 });
    }
    
    const filePath = path.join(process.cwd(), 'public', 'uploads', sanitizedFilename);
    
    // Check if file exists before deleting
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    
    await fs.unlink(filePath);
    
    // Log activity
    try {
      const { prisma } = await import('../../../../../lib/lib/prismaClient');
      await prisma.activityLog.create({
        data: {
          action: 'DELETE_MEDIA',
          details: `Deleted media file: ${filename}`,
          user_id: decoded.id?.toString(),
          user_role: decoded.role,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }
    
    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}