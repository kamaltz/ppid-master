import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const ALGORITHM = 'aes-256-cbc';
const KEY = crypto.scryptSync(process.env.JWT_SECRET || 'default-secret-key', 'salt', 32);

function decryptFile(encryptedBuffer: Buffer, ivHex: string): Buffer {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}

function getUploadDir() {
  if (existsSync('/.dockerenv') || process.env.DOCKER_ENV === 'true') {
    return '/app/uploads';
  }
  return join(process.cwd(), 'public/uploads');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token') || request.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { role: string };
    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const filename = params.filename.replace('.enc', '');
    const uploadDir = getUploadDir();
    const encPath = join(uploadDir, `${filename}.enc`);
    const ivPath = join(uploadDir, `${filename}.iv`);

    if (!existsSync(encPath) || !existsSync(ivPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const encrypted = await readFile(encPath);
    const iv = await readFile(ivPath, 'utf-8');
    const decrypted = decryptFile(encrypted, iv);

    return new NextResponse(decrypted, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (error) {
    console.error('KTP decrypt error:', error);
    return NextResponse.json({ error: 'Failed to decrypt' }, { status: 500 });
  }
}
