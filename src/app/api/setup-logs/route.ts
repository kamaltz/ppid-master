import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';

export async function POST() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS ActivityLog (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        level TEXT DEFAULT 'INFO',
        message TEXT NOT NULL,
        user_id TEXT,
        user_role TEXT,
        user_email TEXT,
        ip_address TEXT,
        user_agent TEXT,
        details TEXT,
        resource_id TEXT,
        resource_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await prisma.$executeRaw`
      INSERT OR IGNORE INTO ActivityLog (action, level, message, user_role, ip_address, created_at)
      VALUES 
        ('SYSTEM_START', 'INFO', 'System initialized', 'SYSTEM', '127.0.0.1', datetime('now')),
        ('LOGIN', 'SUCCESS', 'Admin login successful', 'ADMIN', '127.0.0.1', datetime('now', '-1 hour')),
        ('CREATE_ACCOUNT', 'INFO', 'New account created', 'ADMIN', '127.0.0.1', datetime('now', '-2 hours'))
    `;

    return NextResponse.json({
      success: true,
      message: 'ActivityLog table created and initialized'
    });

  } catch (error) {
    console.error('Setup logs error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to setup logs table'
    }, { status: 500 });
  }
}