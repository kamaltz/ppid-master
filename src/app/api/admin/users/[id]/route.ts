import { NextRequest, NextResponse } from 'next/server';
import { updateUser, deleteUser, resetUserPassword } from '../../../../../../lib/controllers/adminController';

interface MockRequest {
  params: { id: string };
  body: Record<string, unknown>;
  headers: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
}

interface MockResponse {
  status: (code: number) => {
    json: (data: unknown) => void;
    status: (code: number) => MockResponse;
  };
  json: (data: unknown) => void;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const isResetPassword = url.searchParams.get('action') === 'reset-password';
    
    let responseData: unknown;
    let statusCode = 200;
    
    const req: MockRequest = {
      params,
      body: body as Record<string, unknown>,
      headers: Object.fromEntries(request.headers.entries()),
      query: {}
    };
    
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
    
    if (isResetPassword) {
      await resetUserPassword(req, res);
    } else {
      await updateUser(req, res);
    }
    
    return NextResponse.json(responseData, { status: statusCode });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    let responseData: unknown;
    let statusCode = 200;
    
    const req: MockRequest = {
      params,
      body: body as Record<string, unknown>,
      headers: Object.fromEntries(request.headers.entries()),
      query: {}
    };
    
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
    
    await deleteUser(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}