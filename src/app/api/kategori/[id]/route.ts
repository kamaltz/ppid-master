import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Import the in-memory categories from the main route
let categories = [
  { id: 1, nama: "Informasi Berkala", slug: "informasi-berkala", deskripsi: "Informasi yang wajib disediakan secara berkala", created_at: "2024-01-01" },
  { id: 2, nama: "Informasi Setiap Saat", slug: "informasi-setiap-saat", deskripsi: "Informasi yang wajib disediakan setiap saat", created_at: "2024-01-02" },
  { id: 3, nama: "Informasi Serta Merta", slug: "informasi-serta-merta", deskripsi: "Informasi yang wajib diumumkan serta merta", created_at: "2024-01-03" }
];

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!['Admin', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { nama, slug, deskripsi } = await request.json();
    const id = parseInt(params.id);

    // Update in-memory storage
    const categoryIndex = categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    
    const updatedKategori = {
      ...categories[categoryIndex],
      nama,
      slug,
      deskripsi,
      updated_at: new Date().toISOString()
    };
    
    categories[categoryIndex] = updatedKategori;
    return NextResponse.json({ success: true, data: updatedKategori });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Nama atau slug sudah digunakan' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (!['Admin', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const id = parseInt(params.id);

    // Delete from in-memory storage
    const categoryIndex = categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    
    categories.splice(categoryIndex, 1);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}