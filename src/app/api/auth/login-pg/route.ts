import { NextRequest, NextResponse } from 'next/server';
import { login } from '../../../../../lib/controllers/authControllerPG';

interface MockRequest {
  body: unknown;
}

interface MockResponse {
  status: (code: number) => {
    json: (data: unknown) => void;
  };
  json: (data: unknown) => void;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let responseData: unknown;
    let statusCode = 200;
    
    const req: MockRequest = { body };
    const res: MockResponse = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: unknown) => {
            responseData = data;
          }
        };
      },
      json: (data: unknown) => {
        responseData = data;
      }
    };
    
    await login(req, res);
    
    return NextResponse.json(responseData, { status: statusCode });
  } catch {
    return NextResponse.json({ 
      error: 'Server error' 
    }, { status: 500 });
  }
}