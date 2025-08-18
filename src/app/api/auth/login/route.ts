import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface ActivityLog {
  id: number;
  action: string;
  level: string;
  message: string;
  user_id?: string;
  user_role?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  details?: string | object | null;
  created_at: string;
}

declare global {
  var activityLogs: ActivityLog[] | undefined;
}

const prisma = new PrismaClient();

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  // Check various headers for real IP
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const xClientIP = request.headers.get('x-client-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  const xForwarded = request.headers.get('x-forwarded');
  const forwardedFor = request.headers.get('forwarded-for');
  const forwarded = request.headers.get('forwarded');
  
  // Priority order for IP detection
  if (cfConnectingIP) return cfConnectingIP;
  if (xRealIP) return xRealIP;
  if (xClientIP) return xClientIP;
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }
  if (xForwarded) return xForwarded;
  if (forwardedFor) return forwardedFor;
  if (forwarded) {
    // Parse forwarded header: for=192.0.2.60;proto=http;by=203.0.113.43
    const match = forwarded.match(/for=([^;,\s]+)/);
    if (match) return match[1];
  }
  
  // Fallback to localhost
  return '127.0.0.1';
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('Login attempt:', { email, password: password ? 'provided' : 'missing' });
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password harus diisi' }, { status: 400 });
    }

    // Check admin
    const admin = await prisma.admin.findUnique({ where: { email } });
    console.log('Admin found:', admin ? 'yes' : 'no');
    if (admin) {
      const isValid = await bcrypt.compare(password, admin.hashed_password);
      console.log('Admin password valid:', isValid);
      if (isValid) {
        const token = jwt.sign(
          { userId: admin.id, id: admin.id, email: admin.email, nama: admin.nama, role: 'ADMIN' },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );
        
        // Log successful admin login
        try {
          global.activityLogs = global.activityLogs || [];
          global.activityLogs.unshift({
            id: Date.now(),
            action: 'LOGIN',
            level: 'SUCCESS',
            message: `Admin ${email} berhasil login ke sistem`,
            user_id: admin.id.toString(),
            user_role: 'ADMIN',
            user_email: email,
            ip_address: getClientIP(request),
            user_agent: request.headers.get('user-agent') || 'Unknown',
            created_at: new Date().toISOString()
          });
          console.log('Admin login logged successfully');
        } catch (logError) {
          console.error('Failed to log admin login:', logError);
        }
        
        return NextResponse.json({
          success: true,
          token,
          user: { id: admin.id, email: admin.email, nama: admin.nama, role: 'ADMIN' }
        });
      }
    }

    // Check PPID
    const ppid = await prisma.ppid.findUnique({ where: { email } });
    console.log('PPID found:', ppid ? 'yes' : 'no');
    if (ppid) {
      const isValid = await bcrypt.compare(password, ppid.hashed_password);
      console.log('PPID password valid:', isValid);
      if (isValid) {
        const token = jwt.sign(
          { userId: ppid.id, id: ppid.id, email: ppid.email, nama: ppid.nama, role: ppid.role },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );
        
        // Log successful PPID login
        try {
          global.activityLogs = global.activityLogs || [];
          global.activityLogs.unshift({
            id: Date.now(),
            action: 'LOGIN',
            level: 'SUCCESS',
            message: `${ppid.role} ${email} berhasil login ke sistem`,
            user_id: ppid.id.toString(),
            user_role: ppid.role,
            user_email: email,
            ip_address: getClientIP(request),
            user_agent: request.headers.get('user-agent') || 'Unknown',
            created_at: new Date().toISOString()
          });
          console.log('PPID login logged successfully');
        } catch (logError) {
          console.error('Failed to log PPID login:', logError);
        }
        
        return NextResponse.json({
          success: true,
          token,
          user: { id: ppid.id, email: ppid.email, nama: ppid.nama, role: ppid.role }
        });
      }
    }

    // Check Pemohon
    const pemohon = await prisma.pemohon.findUnique({ where: { email } });
    if (pemohon) {
      const isValid = await bcrypt.compare(password, pemohon.hashed_password);
      if (isValid) {
        const token = jwt.sign(
          { userId: pemohon.id, id: pemohon.id, email: pemohon.email, nama: pemohon.nama, role: 'PEMOHON' },
          process.env.JWT_SECRET || 'fallback-secret',
          { expiresIn: '24h' }
        );
        
        // Log successful Pemohon login
        try {
          global.activityLogs = global.activityLogs || [];
          global.activityLogs.unshift({
            id: Date.now() + 1,
            action: 'LOGIN',
            level: 'SUCCESS',
            message: `Pemohon ${email} berhasil login ke sistem`,
            user_id: pemohon.id.toString(),
            user_role: 'PEMOHON',
            user_email: email,
            ip_address: getClientIP(request),
            user_agent: request.headers.get('user-agent') || 'Unknown',
            created_at: new Date().toISOString()
          });
          console.log('Pemohon login logged successfully');
        } catch (logError) {
          console.error('Failed to log Pemohon login:', logError);
        }
        
        return NextResponse.json({
          success: true,
          token,
          user: { id: pemohon.id, email: pemohon.email, nama: pemohon.nama, role: 'PEMOHON' }
        });
      }
    }

    console.log('No valid user found for email:', email);
    
    const clientIP = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    
    // Check for suspicious activity (multiple failed attempts from same IP)
    const recentFailedAttempts = (global.activityLogs || []).filter(log => 
      log.action === 'LOGIN_FAILED' && 
      log.ip_address === clientIP &&
      new Date(log.created_at).getTime() > Date.now() - (15 * 60 * 1000) // Last 15 minutes
    ).length;
    
    const level = recentFailedAttempts >= 3 ? 'ERROR' : 'WARN';
    const message = recentFailedAttempts >= 3 
      ? `SUSPICIOUS: ${recentFailedAttempts + 1} percobaan login gagal dari IP ${clientIP} untuk ${email}`
      : `Percobaan login gagal untuk ${email} dari IP ${clientIP}`;
    
    // Log failed login directly
    try {
      global.activityLogs = global.activityLogs || [];
      global.activityLogs.unshift({
        id: Date.now(),
        action: 'LOGIN_FAILED',
        level,
        message,
        user_email: email,
        ip_address: clientIP,
        user_agent: userAgent,
        details: {
          failedAttempts: recentFailedAttempts + 1,
          suspicious: recentFailedAttempts >= 3
        },
        created_at: new Date().toISOString()
      });
      console.log('Failed login logged successfully');
    } catch (logError) {
      console.error('Failed to log failed login:', logError);
    }
    
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}