import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const files = await readdir(uploadsDir);
    
    const imageFiles = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/uploads/${file}`)
      .sort((a, b) => b.localeCompare(a)); // Sort by newest first
    
    return NextResponse.json({
      success: true,
      images: imageFiles
    });
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    return NextResponse.json({
      success: true,
      images: []
    });
  }
}