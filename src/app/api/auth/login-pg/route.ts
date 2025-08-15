import { NextRequest, NextResponse } from 'next/server';
import { login } from '../../../../../lib/controllers/authControllerPG';

interface MockRequest {
  body: Record<string, unknown>;
}

interface MockResponse {
  status: (code: number) => {
    json: (data: unknown) => void;
    status: (code: number) => MockResponse;
  };
  json: (data: unknown) => void;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let responseData: unknown;
    let statusCode = 200;
    
    const req: MockRequest = { body: body as Record<string, unknown> };
    const res: MockResponse = {
      status: (code: number) => {
        statusCode = code;
        return {
          json: (data: unknown) => {
            responseData = data;
          },
          status: (code: number) => {
            statusCode = code;
            return res;
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