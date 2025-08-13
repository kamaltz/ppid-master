import { NextRequest, NextResponse } from 'next/server';
import { login } from '../../../../../lib/controllers/authControllerPG';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let responseData: any;
    let statusCode = 200;
    
    const req = { body } as any;
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
    
    await login(req, res);
    
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Server error' 
    }, { status: 500 });
  }
}