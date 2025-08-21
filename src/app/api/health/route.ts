import { NextResponse } from 'next/server';
import { prisma, testConnection } from '../../../../lib/lib/prismaClient';

export async function GET() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (isConnected) {
      // Additional check with simple query
      await prisma.$queryRaw`SELECT 1 as test`;
      
      return NextResponse.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error('Database connection test failed');
    }
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}