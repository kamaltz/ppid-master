import { NextRequest, NextResponse } from 'next/server';
import { getAllPermintaan, createPermintaan, getPermintaanStats } from '../../../../lib/controllers/permintaanController';
import { getAuthUser } from '../../../../lib/middleware/authMiddleware';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const url = new URL(request.url);
    const isStats = url.searchParams.get('stats') === 'true';
    
    let responseData: any;
    let statusCode = 200;
    
    const req = {
      query: Object.fromEntries(request.nextUrl.searchParams.entries()),
      headers: Object.fromEntries(request.headers.entries()),
      user
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
      await getPermintaanStats(req, res);
    } else {
      await getAllPermintaan(req, res);
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
    const user = getAuthUser(request);
    if (!user || user.role !== 'Pemohon') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    
    let responseData: any;
    let statusCode = 200;
    
    const req = {
      body,
      headers: Object.fromEntries(request.headers.entries()),
      user
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
    
    await createPermintaan(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}