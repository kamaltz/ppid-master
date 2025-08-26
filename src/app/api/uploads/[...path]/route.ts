import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

function getUploadDir() {
  if (existsSync('/.dockerenv') || process.env.DOCKER_ENV === 'true') {
    return '/app/public/uploads';
  }
  return join(process.cwd(), 'public/uploads');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = params.path.join('/');
    const fullPath = join(getUploadDir(), filePath);
    
    if (!existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await readFile(fullPath);
    
    // Determine content type
    const ext = filePath.split('.').pop()?.toLowerCase();
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon'
    };
    
    const contentType = contentTypes[ext || ''] || 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}