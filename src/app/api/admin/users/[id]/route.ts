import { NextRequest, NextResponse } from 'next/server';
import { updateUser, deleteUser, resetUserPassword } from '../../../../../../lib/controllers/adminController';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const url = new URL(request.url);
    const isResetPassword = url.searchParams.get('action') === 'reset-password';
    
    let responseData: any;
    let statusCode = 200;
    
    const req = {
      params,
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
    
    if (isResetPassword) {
      await resetUserPassword(req, res);
    } else {
      await updateUser(req, res);
    }
    
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
    const body = await request.json();
    
    let responseData: any;
    let statusCode = 200;
    
    const req = {
      params,
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
    
    await deleteUser(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}