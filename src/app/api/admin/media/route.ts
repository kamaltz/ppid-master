import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

interface MediaFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploader: string;
  path: string;
}

const SUPPORTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.html', '.txt', '.json', '.md'];

async function scanDirectory(dirPath: string): Promise<MediaFile[]> {
  const files: MediaFile[] = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath);
        files.push(...subFiles);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (SUPPORTED_EXTENSIONS.includes(ext)) {
          const stats = await fs.stat(fullPath);
          const relativePath = path.relative(path.join(process.cwd(), 'public'), fullPath);
          
          files.push({
            name: entry.name,
            size: stats.size,
            type: ext,
            uploadedAt: stats.mtime.toISOString(),
            uploader: 'Admin',
            path: relativePath.replace(/\\/g, '/')
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error);
  }
  
  return files;
}

export async function GET(request: NextRequest) {
  try {
    // Simplified auth check - in production, implement proper JWT verification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Pastikan direktori uploads ada
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    const files = await scanDirectory(uploadsDir);
    
    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json({
      success: true,
      data: files,
      total: files.length
    });

  } catch (error) {
    console.error('Media scan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function findFileRecursively(dirPath: string, filename: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const found = await findFileRecursively(fullPath, filename);
        if (found) return found;
      } else if (entry.name === filename) {
        return fullPath;
      }
    }
  } catch (error) {
    console.error(`Error searching in ${dirPath}:`, error);
  }
  
  return null;
}

export async function DELETE(request: NextRequest) {
  try {
    // Simplified auth check - in production, implement proper JWT verification
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json({ error: 'Filename required' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const filePath = await findFileRecursively(uploadsDir, filename);
    
    if (!filePath) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    try {
      await fs.unlink(filePath);
      
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch {
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Delete file error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}