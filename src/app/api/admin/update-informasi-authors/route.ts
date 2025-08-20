import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const informasiToUpdate = await prisma.informasiPublik.findMany({
      where: {
        OR: [
          { pejabat_penguasa_informasi: 'PPID Pelaksana' },
          { pejabat_penguasa_informasi: 'PPID Pelaksana Diskominfo Garut' }
        ]
      }
    });

    let updatedCount = 0;

    for (const informasi of informasiToUpdate) {
      try {
        let authorName = 'PPID Pelaksana Diskominfo Garut';
        
        // Try to find actual author name if created_by exists
        if (informasi.created_by) {
          const ppidUser = await prisma.ppid.findUnique({
            where: { id: informasi.created_by },
            select: { nama: true, role: true }
          });
          
          if (ppidUser && ppidUser.role === 'PPID_PELAKSANA') {
            authorName = ppidUser.nama;
          }
        }
        
        await prisma.informasiPublik.update({
          where: { id: informasi.id },
          data: {
            pejabat_penguasa_informasi: authorName
          }
        });
        updatedCount++;
      } catch (error) {
        console.error(`Failed to update informasi ${informasi.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updatedCount} informasi records`,
      totalFound: informasiToUpdate.length,
      updated: updatedCount
    });

  } catch (error) {
    console.error('Update informasi authors error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}