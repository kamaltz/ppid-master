import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/lib/prismaClient';
// import jwt from 'jsonwebtoken'; // Temporarily disabled

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Re-enable authentication after testing
    console.log('Responses GET API called - auth temporarily disabled');

    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const requestData = await prisma.request.findUnique({
      where: { id },
      include: {
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
      data: requestData.responses || []
    });
  } catch (error) {
    console.error('Get responses error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // TODO: Re-enable authentication after testing
    console.log('Responses POST API called - auth temporarily disabled');

    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const userId = '1'; // Default user ID for testing

    const requestData = await prisma.request.findUnique({
      where: { id }
    });

    if (!requestData) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const { message, attachments, user_role, message_type } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const roleNames = {
      'Pemohon': 'Pemohon',
      'Admin': 'Admin',
      'PPID_UTAMA': 'PPID Utama',
      'PPID_PELAKSANA': 'PPID Pelaksana',
      'ATASAN_PPID': 'Atasan PPID',
      'System': 'System'
    };

    // Create response using RequestResponse table
    const response = await prisma.requestResponse.create({
      data: {
        request_id: id,
        user_id: userId,
        user_role: user_role || 'PPID_UTAMA',
        user_name: roleNames[user_role as keyof typeof roleNames] || 'PPID Officer',
        message,
        attachments: attachments ? JSON.stringify(attachments) : null,
        message_type: message_type || 'text'
      }
    });

    // Update request status if needed
    await prisma.request.update({
      where: { id },
      data: {
        status: 'Ditanggapi',
        updated_at: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Response added successfully',
      data: response 
    }, { status: 201 });
  } catch (error) {
    console.error('Add response error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}