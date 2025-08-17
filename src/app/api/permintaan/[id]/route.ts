import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Permintaan GET API called - auth temporarily disabled');

    const id = parseInt(params.id);

    const requestData = await prisma.request.findUnique({
      where: { id },
      include: {
        pemohon: true,
        responses: {
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: requestData
    });
  } catch (error) {
    console.error('Get request error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}