import { NextRequest, NextResponse } from 'next/server';
import { getPermintaanById, updateStatusPermintaan, deletePermintaan } from '../../../../../lib/controllers/permintaanController';
import { getAuthUser } from '../../../../../lib/middleware/authMiddleware';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let responseData: any;
    let statusCode = 200;
    
    const req = {
      params,
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
    
    await getPermintaanById(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(request);
    if (!user || !['PPID', 'PPID_Pelaksana', 'Admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    let responseData: any;
    let statusCode = 200;
    
    const req = {
      params,
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
    
    await updateStatusPermintaan(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let responseData: any;
    let statusCode = 200;
    
    const req = {
      params,
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
    
    await deletePermintaan(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}