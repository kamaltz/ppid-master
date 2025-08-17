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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      const files = await fs.readdir(uploadsDir);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(uploadsDir, file);
          const stats = await fs.stat(filePath);
          const ext = path.extname(file).toLowerCase();
          
          return {
            name: file,
            size: stats.size,
            type: ext,
            uploadedAt: stats.birthtime.toISOString(),
            uploader: 'System'
          };
        })
      );

      return NextResponse.json({ success: true, data: fileDetails });
    } catch (error) {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { filename } = await request.json();
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
    
    await fs.unlink(filePath);
    
    return NextResponse.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}