import { NextRequest, NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check permissions - only admin and PPID can list images
    if (decoded.role === 'Pemohon') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const uploadsPath = join(process.cwd(), 'public/uploads/images');
    
    try {
      const files = await readdir(uploadsPath);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
      ).map(file => ({
        name: file,
        url: `/uploads/images/${file}`
      }));

      return NextResponse.json({ 
        success: true, 
        images: imageFiles 
      });
    } catch (error) {
      // Directory might not exist
      return NextResponse.json({ 
        success: true, 
        images: [] 
      });
    }
  } catch (error) {
    console.error('List images error:', error);
    return NextResponse.json({ success: false, error: 'Failed to list images' }, { status: 500 });
  }
}