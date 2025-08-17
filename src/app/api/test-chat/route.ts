import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        message: message || 'Test message',
        timestamp: new Date().toISOString()
      } 
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}