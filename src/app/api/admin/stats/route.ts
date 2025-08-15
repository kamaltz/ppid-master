import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '../../../../../lib/controllers/adminController';

interface MockRequest {
  headers: Record<string, string>;
}

interface MockResponse {
  status: (code: number) => {
    json: (data: unknown) => void;
  };
  json: (data: unknown) => void;
}

export async function GET(request: NextRequest) {
  try {
    let responseData: unknown;
    let statusCode = 200;
    
    const req: MockRequest = {
      headers: Object.fromEntries(request.headers.entries()),
    };
    
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
    
    await getDashboardStats(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}