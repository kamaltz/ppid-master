import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.scryptSync(process.env.JWT_SECRET || 'default-secret-key', 'salt', 32);

function encryptFile(buffer: Buffer): { encrypted: Buffer; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encrypted, iv: iv.toString('hex') };
}

// Determine upload directory based on environment
function getUploadDir() {
  // Check if running in Docker container
  if (existsSync('/.dockerenv') || process.env.DOCKER_ENV === 'true') {
    return '/app/uploads';
  }
  // Development or non-Docker production
  return join(process.cwd(), 'public/uploads');
}

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
    const uploadDir = getUploadDir();
    
    const isKtp = data.get('isKtp') === 'true';
    let filePath = join(uploadDir, filename);
    let iv = null;
    
    if (isKtp) {
      const { encrypted, iv: ivHex } = encryptFile(buffer);
      iv = ivHex;
      filePath = join(uploadDir, `${timestamp}-${sanitizedName}.enc`);
      
      try {
        await mkdir(uploadDir, { recursive: true });
        await writeFile(filePath, encrypted);
        await writeFile(join(uploadDir, `${timestamp}-${sanitizedName}.iv`), iv);
        
        if (!existsSync(filePath)) {
          throw new Error('File was not saved properly');
        }
        
        console.log('Encrypted KTP uploaded:', filePath);
      } catch (fsError) {
        console.error('File system error:', fsError);
        throw new Error(`Failed to save file: ${(fsError as Error).message}`);
      }
      
      return NextResponse.json({ 
        success: true, 
        filename: `${timestamp}-${sanitizedName}.enc`,
        originalName: file.name,
        size: file.size,
        url: `/uploads/${timestamp}-${sanitizedName}.enc`,
        iv
      });
    }

    try {
      await mkdir(uploadDir, { recursive: true });
      await writeFile(filePath, buffer);
      
      if (!existsSync(filePath)) {
        throw new Error('File was not saved properly');
      }
      
      console.log('File uploaded successfully:', filePath);
    } catch (fsError) {
      console.error('File system error:', fsError);
      throw new Error(`Failed to save file: ${(fsError as Error).message}`);
    }

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