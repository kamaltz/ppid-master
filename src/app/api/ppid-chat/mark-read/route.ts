import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // Mark as read in localStorage (client-side handling)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking PPID chat as read:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}