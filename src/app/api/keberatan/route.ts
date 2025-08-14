import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET!);

    // Return empty array for now since keberatan table doesn't exist in schema
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    console.error('Get keberatan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}