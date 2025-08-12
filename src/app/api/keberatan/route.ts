import { NextRequest, NextResponse } from 'next/server';
import { getAllKeberatan, createKeberatan, getKeberatanStats } from '../../../../lib/controllers/keberatanController';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const isStats = url.searchParams.get('stats') === 'true';
    
    let responseData: any;
    let statusCode = 200;
    
    const req = {
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      headers: Object.fromEntries(request.headers.entries()),
      user: { userId: 1, role: 'Admin' } // TODO: Get from auth middleware
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
    
    if (isStats) {
      await getKeberatanStats(req, res);
    } else {
      await getAllKeberatan(req, res);
    }
    
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let responseData: any;
    let statusCode = 200;
    
    const req = {
      body,
      headers: Object.fromEntries(request.headers.entries()),
      user: { userId: 1, role: 'Pemohon' } // TODO: Get from auth middleware
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
    
    await createKeberatan(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}