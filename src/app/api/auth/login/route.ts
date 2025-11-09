import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  sanitizeInput,
  validateEmail,
  validateInput,
} from "@/lib/xssProtection";
import { apiSecurityMiddleware } from "@/lib/apiSecurityMiddleware";

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
  var ipBlacklist: Set<string> | undefined;
  var loginAttempts: Map<string, number[]> | undefined;
}

// Simple logging function
const logActivity = async (logData: Omit<ActivityLog, "id" | "created_at">) => {
  try {
    global.activityLogs = global.activityLogs || [];
    global.activityLogs.unshift({
      id: Date.now(),
      ...logData,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

const prisma = new PrismaClient();

// Global blacklist and rate limiting
global.ipBlacklist = global.ipBlacklist || new Set();
global.loginAttempts = global.loginAttempts || new Map();

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  // Check various headers for real IP
  const xForwardedFor = request.headers.get("x-forwarded-for");
  const xRealIP = request.headers.get("x-real-ip");
  const xClientIP = request.headers.get("x-client-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  const xForwarded = request.headers.get("x-forwarded");
  const forwardedFor = request.headers.get("forwarded-for");
  const forwarded = request.headers.get("forwarded");

  // Priority order for IP detection
  if (cfConnectingIP) return cfConnectingIP;
  if (xRealIP) return xRealIP;
  if (xClientIP) return xClientIP;
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return xForwardedFor.split(",")[0].trim();
  }
  if (xForwarded) return xForwarded;
  if (forwardedFor) return forwardedFor;
  if (forwarded) {
    // Parse forwarded header: for=192.0.2.60;proto=http;by=203.0.113.43
    const match = forwarded.match(/for=([^;,\s]+)/);
    if (match) return match[1];
  }

  // Fallback to localhost
  return "127.0.0.1";
}

// Block GET requests
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST for login." },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clientIP = getClientIP(request);

    // Sanitize inputs
    const email = sanitizeInput(body.email || "");
    const password = body.password || "";

    console.log("Login attempt:", {
      email,
      ip: clientIP,
      password: password ? "provided" : "missing",
    });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Validate inputs
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid" },
        { status: 400 }
      );
    }

    if (!validateInput(password, 100)) {
      return NextResponse.json(
        { error: "Password mengandung karakter tidak valid" },
        { status: 400 }
      );
    }

    // Check if IP is blacklisted
    if (global.ipBlacklist?.has(clientIP)) {
      await logActivity({
        action: "LOGIN_BLOCKED",
        level: "ERROR",
        message: `Login diblokir dari IP blacklist: ${clientIP}`,
        user_email: email,
        ip_address: clientIP,
        user_agent: request.headers.get("user-agent") || "Unknown",
      });
      return NextResponse.json(
        {
          error:
            "IP address diblokir karena terlalu banyak percobaan login gagal",
        },
        { status: 429 }
      );
    }

    // Check rate limiting (5 attempts in 15 minutes)
    const now = Date.now();
    const attempts = global.loginAttempts?.get(clientIP) || [];
    const recentAttempts = attempts.filter(
      (time: number) => now - time < 15 * 60 * 1000
    ); // 15 minutes

    if (recentAttempts.length >= 5) {
      // Add to blacklist after 5 failed attempts
      global.ipBlacklist?.add(clientIP);

      await logActivity({
        action: "IP_BLACKLISTED",
        level: "ERROR",
        message: `IP ${clientIP} ditambahkan ke blacklist setelah 5 percobaan login gagal`,
        user_email: email,
        ip_address: clientIP,
        user_agent: request.headers.get("user-agent") || "Unknown",
        details: { attempts: recentAttempts.length },
      });

      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. IP address telah diblokir." },
        { status: 429 }
      );
    }

    // Check admin
    const admin = await prisma.admin.findUnique({ where: { email } });
    console.log("Admin found:", admin ? "yes" : "no");
    if (admin) {
      const isValid = await bcrypt.compare(password, admin.hashed_password);
      console.log("Admin password valid:", isValid);
      if (!isValid) {
        // Log failed admin login
        try {
          await prisma.activityLog.create({
            data: {
              action: "LOGIN_FAILED",
              level: "WARN",
              details: `Percobaan login gagal untuk Admin ${email}`,
              user_id: admin.id.toString(),
              user_role: "ADMIN",
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || "Unknown"
            }
          });
        } catch (logError) {
          console.error('Failed to log admin failed login:', logError);
        }
      }
      if (isValid) {
        const token = jwt.sign(
          {
            userId: admin.id,
            id: admin.id,
            email: admin.email,
            nama: admin.nama,
            role: "ADMIN",
          },
          process.env.JWT_SECRET || "fallback-secret",
          { expiresIn: "24h" }
        );

        // Clear failed attempts on successful login
        global.loginAttempts?.delete(getClientIP(request));

        // Log successful admin login to database
        try {
          await prisma.activityLog.create({
            data: {
              action: "LOGIN",
              level: "SUCCESS",
              details: `Admin ${email} berhasil login ke sistem`,
              user_id: admin.id.toString(),
              user_role: "ADMIN",
              ip_address: getClientIP(request),
              user_agent: request.headers.get("user-agent") || "Unknown"
            }
          });
        } catch (logError) {
          console.error('Failed to log admin login:', logError);
        }
        
        await logActivity({
          action: "LOGIN",
          level: "SUCCESS",
          message: `Admin ${email} berhasil login ke sistem`,
          user_id: admin.id.toString(),
          user_role: "ADMIN",
          user_email: email,
          ip_address: getClientIP(request),
          user_agent: request.headers.get("user-agent") || "Unknown",
        });

        return NextResponse.json({
          success: true,
          token,
          user: {
            id: admin.id,
            email: admin.email,
            nama: admin.nama,
            role: "ADMIN",
          },
        });
      }
    }

    // Check PPID
    const ppid = await prisma.ppid.findUnique({ where: { email } });
    console.log("PPID found:", ppid ? "yes" : "no");
    if (ppid) {
      const isValid = await bcrypt.compare(password, ppid.hashed_password);
      console.log("PPID password valid:", isValid);
      if (!isValid) {
        // Log failed PPID login
        try {
          await prisma.activityLog.create({
            data: {
              action: "LOGIN_FAILED",
              level: "WARN",
              details: `Percobaan login gagal untuk ${ppid.role} ${email}`,
              user_id: ppid.id.toString(),
              user_role: ppid.role,
              ip_address: clientIP,
              user_agent: request.headers.get("user-agent") || "Unknown"
            }
          });
        } catch (logError) {
          console.error('Failed to log PPID failed login:', logError);
        }
      }
      if (isValid) {
        const token = jwt.sign(
          {
            userId: ppid.id,
            id: ppid.id,
            email: ppid.email,
            nama: ppid.nama,
            role: ppid.role,
          },
          process.env.JWT_SECRET || "fallback-secret",
          { expiresIn: "24h" }
        );

        // Clear failed attempts on successful login
        global.loginAttempts?.delete(getClientIP(request));

        // Log successful PPID login to database
        try {
          await prisma.activityLog.create({
            data: {
              action: "LOGIN",
              level: "SUCCESS",
              details: `${ppid.role} ${email} berhasil login ke sistem`,
              user_id: ppid.id.toString(),
              user_role: ppid.role,
              ip_address: getClientIP(request),
              user_agent: request.headers.get("user-agent") || "Unknown"
            }
          });
          console.log('✅ PPID login logged to database, user_id:', ppid.id);
        } catch (logError) {
          console.error('❌ Failed to log PPID login:', logError);
        }
        
        await logActivity({
          action: "LOGIN",
          level: "SUCCESS",
          message: `${ppid.role} ${email} berhasil login ke sistem`,
          user_id: ppid.id.toString(),
          user_role: ppid.role,
          user_email: email,
          ip_address: getClientIP(request),
          user_agent: request.headers.get("user-agent") || "Unknown",
        });

        return NextResponse.json({
          success: true,
          token,
          user: {
            id: ppid.id,
            email: ppid.email,
            nama: ppid.nama,
            role: ppid.role,
          },
        });
      }
    }

    // Check Pemohon
    const pemohon = await prisma.pemohon.findUnique({ where: { email } });
    if (pemohon) {
      const isValid = await bcrypt.compare(password, pemohon.hashed_password);
      if (isValid) {
        // Check if pemohon account is approved
        if (!pemohon.is_approved) {
          return NextResponse.json(
            {
              error:
                "Akun Anda sedang dalam proses persetujuan oleh PPID. Harap tunggu 1x24 jam kerja untuk dapat login dan mengajukan permohonan.",
              needsApproval: true,
              registrationDate: pemohon.created_at,
            },
            { status: 403 }
          );
        }

        const token = jwt.sign(
          {
            userId: pemohon.id,
            id: pemohon.id,
            email: pemohon.email,
            nama: pemohon.nama,
            role: "PEMOHON",
          },
          process.env.JWT_SECRET || "fallback-secret",
          { expiresIn: "24h" }
        );

        // Clear failed attempts on successful login
        global.loginAttempts?.delete(getClientIP(request));

        // Log successful Pemohon login to database
        try {
          await prisma.activityLog.create({
            data: {
              action: "LOGIN",
              level: "SUCCESS",
              details: `Pemohon ${email} berhasil login ke sistem`,
              user_id: pemohon.id.toString(),
              user_role: "PEMOHON",
              ip_address: getClientIP(request),
              user_agent: request.headers.get("user-agent") || "Unknown"
            }
          });
        } catch (logError) {
          console.error('Failed to log pemohon login:', logError);
        }
        
        await logActivity({
          action: "LOGIN",
          level: "SUCCESS",
          message: `Pemohon ${email} berhasil login ke sistem`,
          user_id: pemohon.id.toString(),
          user_role: "PEMOHON",
          user_email: email,
          ip_address: getClientIP(request),
          user_agent: request.headers.get("user-agent") || "Unknown",
        });

        return NextResponse.json({
          success: true,
          token,
          user: {
            id: pemohon.id,
            email: pemohon.email,
            nama: pemohon.nama,
            role: "PEMOHON",
            is_approved: pemohon.is_approved,
          },
        });
      }
    }

    console.log("No valid user found for email:", email);

    const userAgent = request.headers.get("user-agent") || "Unknown";

    // Record failed attempt
    const ipAttempts = global.loginAttempts?.get(clientIP) || [];
    ipAttempts.push(now);
    global.loginAttempts?.set(clientIP, ipAttempts);

    // Clean old attempts (older than 15 minutes)
    const cleanAttempts = ipAttempts.filter(
      (time: number) => now - time < 15 * 60 * 1000
    );
    global.loginAttempts?.set(clientIP, cleanAttempts);

    const level = cleanAttempts.length >= 4 ? "ERROR" : "WARN";
    const message =
      cleanAttempts.length >= 4
        ? `CRITICAL: ${cleanAttempts.length} percobaan login gagal dari IP ${clientIP} untuk ${email} - IP akan diblokir pada percobaan berikutnya`
        : `Percobaan login gagal untuk ${email} dari IP ${clientIP} (${cleanAttempts.length}/5)`;

    // Log failed login to database
    try {
      await prisma.activityLog.create({
        data: {
          action: "LOGIN_FAILED",
          level,
          details: message,
          user_id: email,
          user_role: "UNKNOWN",
          ip_address: clientIP,
          user_agent: userAgent
        }
      });
      console.log("Failed login logged to database");
    } catch (logError) {
      console.error("Failed to log failed login:", logError);
    }
    
    // Log failed login to memory
    try {
      global.activityLogs = global.activityLogs || [];
      global.activityLogs.unshift({
        id: Date.now(),
        action: "LOGIN_FAILED",
        level,
        message,
        user_email: email,
        ip_address: clientIP,
        user_agent: userAgent,
        details: {
          failedAttempts: cleanAttempts.length,
          remainingAttempts: 5 - cleanAttempts.length,
          willBeBlocked: cleanAttempts.length >= 4,
        },
        created_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error("Failed to log failed login to memory:", logError);
    }

    return NextResponse.json(
      { error: "Email atau password salah" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
