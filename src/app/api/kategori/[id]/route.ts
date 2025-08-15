import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  id: string;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const category = global.categories?.find(c => c.id === id);
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('GET /api/kategori/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const id = parseInt(params.id);

    if (!global.categories) {
      global.categories = [];
    }

    // Update in global storage
    const categoryIndex = global.categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    
    const updatedKategori = {
      ...global.categories[categoryIndex],
      nama,
      slug,
      deskripsi,
      updated_at: new Date().toISOString()
    };
    
    global.categories[categoryIndex] = updatedKategori;
    return NextResponse.json({ success: true, data: updatedKategori });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    if (!['Admin', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const id = parseInt(params.id);

    if (!global.categories) {
      global.categories = [];
    }

    // Delete from global storage
    const categoryIndex = global.categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    
    global.categories.splice(categoryIndex, 1);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete category' }, { status: 500 });
  }
}