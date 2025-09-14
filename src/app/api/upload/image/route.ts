import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Determine upload directory based on environment
function getUploadDir() {
  // Check if running in Docker container
  if (existsSync('/.dockerenv') || process.env.DOCKER_ENV === 'true') {
    return '/app/public/uploads/images';
  }
  // Development or non-Docker production
  return join(process.cwd(), 'public/uploads/images');
}

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

    // Validate file size (10MB max for images)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Image file too large (max 10MB)' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename and sanitize
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.\./g, '_');
    const filename = `${timestamp}-${sanitizedName}`;
    const uploadDir = getUploadDir();
    const filePath = join(uploadDir, filename);

    try {
      // Ensure directory exists
      await mkdir(uploadDir, { recursive: true });
      
      // Write file
      await writeFile(filePath, buffer);
      
      // Verify file was written
      if (!existsSync(filePath)) {
        throw new Error('File was not saved properly');
      }
      
      console.log('File uploaded successfully:', filePath);
    } catch (fsError) {
      console.error('File system error:', fsError);
      throw new Error(`Failed to save file: ${(fsError as Error).message}`);
    }

    // Return URL that works in both Docker and development
    const baseUrl = process.env.NODE_ENV === 'production' ? '/api/uploads' : '/uploads';
    
    return NextResponse.json({ 
      success: true, 
      filename,
      originalName: file.name,
      size: file.size,
      url: `${baseUrl}/images/${filename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Upload failed'
    }, { status: 500 });
  }
}