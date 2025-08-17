import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
// import jwt from 'jsonwebtoken'; // Temporarily disabled
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    // TODO: Re-enable authentication after testing
    console.log('Upload API called - auth temporarily disabled');

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    // Validate that it's actually an image
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (2MB max for images)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image file too large (max 2MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename and sanitize
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.\./g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const uploadDir = join(process.cwd(), 'public/uploads/images');
    const path = join(uploadDir, filename);

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(path, buffer);

    return NextResponse.json({ 
      success: true, 
      filename,
      originalName: file.name,
      size: file.size,
      url: `/uploads/images/${filename}`
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}