import { NextRequest, NextResponse } from 'next/server';
import { getInformasiById, updateInformasi, deleteInformasi } from '../../../../../lib/controllers/informasiController';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    let responseData: any;
    let statusCode = 200;
    
    const req = {
      params,
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
    
    await getInformasiById(req, res);
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
    
    await updateInformasi(req, res);
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
    let responseData: any;
    let statusCode = 200;
    
    const req = {
      params,
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
    
    await deleteInformasi(req, res);
    return NextResponse.json(responseData, { status: statusCode });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}