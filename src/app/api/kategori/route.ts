import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  id: string;
}

// In-memory storage for categories
const categories = [
  { id: 1, nama: "Informasi Berkala", slug: "informasi-berkala", deskripsi: "Informasi yang wajib disediakan secara berkala", created_at: "2024-01-01" },
  { id: 2, nama: "Informasi Setiap Saat", slug: "informasi-setiap-saat", deskripsi: "Informasi yang wajib disediakan setiap saat", created_at: "2024-01-02" },
  { id: 3, nama: "Informasi Serta Merta", slug: "informasi-serta-merta", deskripsi: "Informasi yang wajib diumumkan serta merta", created_at: "2024-01-03" }
];

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: categories });
  } catch (error: unknown) {
    console.error('GET /api/kategori error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch categories' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    if (!['Admin', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { nama, slug, deskripsi } = await request.json();

    // Add to in-memory storage
    const newKategori = {
      id: Date.now(),
      nama,
      slug,
      deskripsi,
      created_at: new Date().toISOString()
    };
    
    categories.push(newKategori);
    return NextResponse.json({ success: true, data: newKategori });
  } catch (error: unknown) {
    console.error('POST /api/kategori error:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Nama atau slug sudah digunakan' }, { status: 400 });
    }
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create category' 
    }, { status: 500 });
  }
}