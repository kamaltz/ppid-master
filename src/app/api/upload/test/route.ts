import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const isDocker = existsSync('/.dockerenv') || process.env.DOCKER_ENV === 'true';
    const uploadDir = isDocker ? '/app/uploads' : join(process.cwd(), 'public/uploads');
    const dirExists = existsSync(uploadDir);
    
    return NextResponse.json({
      success: true,
      environment: {
        isDocker,
        uploadDir,
        dirExists,
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}