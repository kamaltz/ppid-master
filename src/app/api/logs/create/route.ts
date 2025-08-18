import { NextRequest, NextResponse } from 'next/server';

// Global log storage
global.activityLogs = global.activityLogs || [
  {
    id: 1,
    action: 'SYSTEM_START',
    level: 'INFO',
    message: 'Sistem log aktivitas dimulai',
    user_role: 'SYSTEM',
    ip_address: '127.0.0.1',
    created_at: new Date().toISOString()
  }
];

export async function POST(request: NextRequest) {
  try {
    const logData = await request.json();
    console.log('Creating log:', logData);
    
    const newLog = {
      id: Date.now(),
      ...logData,
      created_at: new Date().toISOString()
    };
    
    global.activityLogs?.unshift(newLog);
    
    if (global.activityLogs && global.activityLogs.length > 1000) {
      global.activityLogs = global.activityLogs.slice(0, 1000);
    }
    
    console.log('Log created successfully, total logs:', global.activityLogs?.length || 0);
    return NextResponse.json({ success: true, log: newLog });
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function GET() {
  console.log('Getting logs, total:', global.activityLogs?.length || 0);
  return NextResponse.json({
    success: true,
    data: global.activityLogs || [],
    pagination: { page: 1, limit: 50, total: global.activityLogs?.length || 0, pages: 1 }
  });
}