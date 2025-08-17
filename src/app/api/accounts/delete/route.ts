import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  id: string;
  email: string;
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (decoded.role !== 'Admin' && decoded.role !== 'PPID_UTAMA') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { accountId } = await request.json();
    
    if (!accountId || typeof accountId !== 'string') {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    const [table, id] = accountId.split('_');
    const numericId = parseInt(id);

    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    let deletedAccount;
    switch (table) {
      case 'admin':
        deletedAccount = await prisma.admin.delete({
          where: { id: numericId }
        });
        break;
      case 'pemohon':
        deletedAccount = await prisma.pemohon.delete({
          where: { id: numericId }
        });
        break;
      case 'ppid':
        deletedAccount = await prisma.ppid.delete({
          where: { id: numericId }
        });
        break;
      default:
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'DELETE_ACCOUNT',
          details: `Deleted ${table} account: ${deletedAccount.nama} (${deletedAccount.email})`,
          user_id: decoded.id,
          user_role: decoded.role,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Account deleted successfully' 
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}