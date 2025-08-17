import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const admin = await prisma.admin.upsert({
      where: { email: 'admin@garutkab.go.id' },
      update: { hashed_password: hashedPassword },
      create: {
        email: 'admin@garutkab.go.id',
        hashed_password: hashedPassword,
        nama: 'Administrator PPID'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin account ready',
      credentials: {
        email: 'admin@garutkab.go.id',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('Reset admin error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to reset admin'
    }, { status: 500 });
  }
}