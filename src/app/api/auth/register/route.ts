import { NextRequest, NextResponse } from 'next/server';
import { register } from '../../../../../lib/controllers/authController';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let responseData: any;
    let statusCode = 200;
    
    const req = {
      body,
      headers: Object.fromEntries(request.headers.entries()),
    } as any;
    
    const res = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: any) => {
            responseData = data;
          }
        };
      },
      json: (data: any) => {
        responseData = data;
      }
    } as any;
    
    await register(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}