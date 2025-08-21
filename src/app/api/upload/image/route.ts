import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
// import jwt from 'jsonwebtoken'; // Temporarily disabled
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Validate that it's actually an image
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (5MB max for images)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Image file too large (max 5MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename and sanitize
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.\./g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const uploadDir = '/app/uploads/images';
    const path = join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path, buffer);

    return NextResponse.json({ 
      success: true, 
      filename,
      originalName: file.name,
      size: file.size,
      url: `/uploads/images/${filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Upload failed'
    }, { status: 500 });
  }
}