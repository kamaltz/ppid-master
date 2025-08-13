import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/middleware/authMiddleware';
import { createPermintaan } from '../../../../lib/controllers/permintaanController';

export async function POST(request: NextRequest) {
  try {
    // Test auth
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'No auth token',
        step: 'AUTH'
      });
    }

    if (user.role !== 'Pemohon') {
      return NextResponse.json({
        success: false,
        error: `Wrong role: ${user.role}`,
        step: 'ROLE'
      });
    }

    // Test body
    const body = await request.json();

    // Call controller
    let responseData: any;
    let statusCode = 200;
    
    const req = { body, user } as any;
    const res = {
      status: (code: number) => {
        statusCode = code;
        return { json: (data: any) => { responseData = data; } };
      },
      json: (data: any) => { responseData = data; }
    } as any;
    
    await createPermintaan(req, res);
    
    return NextResponse.json({
      success: statusCode < 400,
      statusCode,
      responseData,
      user: { id: user.userId, role: user.role }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      step: 'EXCEPTION'
    });
  }
}