import { NextRequest, NextResponse } from 'next/server';

// Global storage
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
global.ipBlacklist = global.ipBlacklist || new Set();
global.loginAttempts = global.loginAttempts || new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle blacklist management
    if (body.action === 'getBlacklist') {
      const blacklist = Array.from(global.ipBlacklist || []);
      return NextResponse.json({ success: true, blacklist });
    }

    if (body.action === 'unblockIP' && body.ip) {
      global.ipBlacklist?.delete(body.ip);
      global.loginAttempts?.delete(body.ip);
      
      // Log unblock action
      global.activityLogs = global.activityLogs || [];
      global.activityLogs.unshift({
        id: Date.now(),
        action: 'IP_UNBLOCKED',
        level: 'INFO',
        message: `IP ${body.ip} dihapus dari blacklist oleh admin`,
        user_role: 'ADMIN',
        ip_address: body.ip,
        created_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: `IP ${body.ip} berhasil dihapus dari blacklist` });
    }

    if (body.action === 'clearBlacklist') {
      const count = global.ipBlacklist?.size || 0;
      global.ipBlacklist?.clear();
      global.loginAttempts?.clear();
      
      // Log clear action
      global.activityLogs = global.activityLogs || [];
      global.activityLogs.unshift({
        id: Date.now(),
        action: 'BLACKLIST_CLEARED',
        level: 'INFO',
        message: `Semua IP blacklist (${count} IP) dihapus oleh admin`,
        user_role: 'ADMIN',
        created_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: `${count} IP berhasil dihapus dari blacklist` });
    }
    
    // Handle regular log creation
    const logData = body;
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
    console.error('Error:', error);
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