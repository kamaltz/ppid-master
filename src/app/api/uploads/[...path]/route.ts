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
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const { path } = resolvedParams;
  try {
    const filePath = path.join('/');
    const fullPath = join(getUploadDir(), filePath);
    
    if (!existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await readFile(fullPath);
    
    // Determine content type
    const ext = filePath.split('.').pop()?.toLowerCase();
    const fileName = path[path.length - 1];
    
    const contentTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'ico': 'image/x-icon',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed'
    };
    
    const contentType = contentTypes[ext || ''] || 'application/octet-stream';
    
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000',
    };
    
    // Add download headers for non-image files
    if (!contentType.startsWith('image/')) {
      headers['Content-Disposition'] = `attachment; filename="${fileName}"`;
    }
    
    return new NextResponse(fileBuffer as any, { headers });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}