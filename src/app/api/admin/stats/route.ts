import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '../../../../../lib/controllers/adminController';

export async function GET(request: NextRequest) {
  try {
    let responseData: any;
    let statusCode = 200;
    
    const req = {
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
    
    await getDashboardStats(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}