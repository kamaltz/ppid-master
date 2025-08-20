import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload API called - auth temporarily disabled');

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    console.log('File received:', file ? file.name : 'No file');

    if (!file || file.size === 0) {
      console.log('No file or empty file');
      return NextResponse.json({ success: false, error: 'No file uploaded or file is empty' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf', 'application/msword'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'File type not allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\\.\\./g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    // Always use /app/uploads for Docker deployment
    const uploadDir = '/app/uploads';
    const path = join(uploadDir, filename);

    try {
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path, buffer);
      console.log('File saved successfully:', path);
    } catch (fsError) {
      console.error('File system error:', fsError);
      console.error('Upload dir:', uploadDir);
      console.error('Full path:', path);
      throw new Error(`Failed to save file: ${fsError.message}`);
    }

    console.log('File uploaded successfully:', filename);

    return NextResponse.json({ 
      success: true, 
      filename,
      originalName: file.name,
      size: file.size,
      url: `/uploads/${filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}