import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
// import jwt from 'jsonwebtoken'; // Temporarily disabled
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Upload Image API Called ===');
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    const data = await request.formData();
    console.log('FormData entries:', Array.from(data.entries()).map(([key, value]) => [key, value instanceof File ? `File: ${value.name}` : value]));
    
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      console.log('❌ No file in FormData');
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    console.log('✅ File received:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    if (!file || file.size === 0) {
      console.log('❌ File is empty or invalid');
      return NextResponse.json({ success: false, error: 'No file uploaded or file is empty' }, { status: 400 });
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
    // Always use /app/uploads for Docker deployment
    const uploadDir = '/app/uploads/images';
    const path = join(uploadDir, filename);

    console.log('Upload directory:', uploadDir);
    console.log('Full file path:', path);
    console.log('Filename:', filename);

    try {
      console.log('Creating directory...');
      await mkdir(uploadDir, { recursive: true });
      console.log('✅ Directory created/exists');
      
      console.log('Writing file...');
      await writeFile(path, buffer);
      console.log('✅ File saved successfully:', path);
    } catch (fsError) {
      console.error('❌ File system error:', fsError);
      console.error('Error details:', {
        code: (fsError as any).code,
        errno: (fsError as any).errno,
        syscall: (fsError as any).syscall,
        path: (fsError as any).path
      });
      throw new Error(`Failed to save file: ${(fsError as Error).message}`);
    }

    // Return appropriate URL based on environment
    const fileUrl = process.env.NODE_ENV === 'production'
      ? `/uploads/images/${filename}`
      : `/uploads/images/${filename}`;

    return NextResponse.json({ 
      success: true, 
      filename,
      originalName: file.name,
      size: file.size,
      url: fileUrl
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    console.error('Error stack:', (error as Error).stack);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error message:', errorMessage);
    
    return NextResponse.json({ 
      success: false, 
      error: `Upload failed: ${errorMessage}`,
      details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    }, { status: 500 });
  }
}