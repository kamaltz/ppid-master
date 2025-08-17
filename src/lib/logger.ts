import { prisma } from '../../lib/lib/prismaClient';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}

export enum LogAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  
  // Account Management
  CREATE_ACCOUNT = 'CREATE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  RESET_PASSWORD = 'RESET_PASSWORD',
  
  // Permissions
  UPDATE_PERMISSIONS = 'UPDATE_PERMISSIONS',
  GRANT_ACCESS = 'GRANT_ACCESS',
  REVOKE_ACCESS = 'REVOKE_ACCESS',
  
  // Content Management
  CREATE_INFORMASI = 'CREATE_INFORMASI',
  UPDATE_INFORMASI = 'UPDATE_INFORMASI',
  DELETE_INFORMASI = 'DELETE_INFORMASI',
  CREATE_KATEGORI = 'CREATE_KATEGORI',
  UPDATE_KATEGORI = 'UPDATE_KATEGORI',
  DELETE_KATEGORI = 'DELETE_KATEGORI',
  CREATE_PAGE = 'CREATE_PAGE',
  UPDATE_PAGE = 'UPDATE_PAGE',
  DELETE_PAGE = 'DELETE_PAGE',
  
  // Requests
  CREATE_PERMOHONAN = 'CREATE_PERMOHONAN',
  UPDATE_PERMOHONAN = 'UPDATE_PERMOHONAN',
  APPROVE_PERMOHONAN = 'APPROVE_PERMOHONAN',
  REJECT_PERMOHONAN = 'REJECT_PERMOHONAN',
  CREATE_KEBERATAN = 'CREATE_KEBERATAN',
  UPDATE_KEBERATAN = 'UPDATE_KEBERATAN',
  
  // System
  SYSTEM_BACKUP = 'SYSTEM_BACKUP',
  SYSTEM_RESTORE = 'SYSTEM_RESTORE',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DELETE = 'FILE_DELETE',
  
  // Security
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  ACCESS_DENIED = 'ACCESS_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED'
}

interface LogData {
  action: LogAction;
  level: LogLevel;
  message: string;
  userId?: string;
  userRole?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  resourceId?: string;
  resourceType?: string;
}

export class Logger {
  static async log(data: LogData) {
    try {
      await prisma.activityLog.create({
        data: {
          action: data.action,
          level: data.level,
          message: data.message,
          user_id: data.userId || null,
          user_role: data.userRole || null,
          user_email: data.userEmail || null,
          ip_address: data.ipAddress || null,
          user_agent: data.userAgent || null,
          details: data.details ? JSON.stringify(data.details) : null,
          resource_id: data.resourceId || null,
          resource_type: data.resourceType || null,
          created_at: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  static async logAuth(action: LogAction, email: string, success: boolean, ipAddress?: string, userAgent?: string, details?: any) {
    await this.log({
      action,
      level: success ? LogLevel.SUCCESS : LogLevel.WARN,
      message: success ? `${action} successful for ${email}` : `${action} failed for ${email}`,
      userEmail: email,
      ipAddress,
      userAgent,
      details
    });
  }

  static async logUserAction(action: LogAction, userId: string, userRole: string, userEmail: string, message: string, ipAddress?: string, details?: any) {
    await this.log({
      action,
      level: LogLevel.INFO,
      message,
      userId,
      userRole,
      userEmail,
      ipAddress,
      details
    });
  }

  static async logSystemAction(action: LogAction, message: string, userId?: string, userRole?: string, details?: any) {
    await this.log({
      action,
      level: LogLevel.INFO,
      message,
      userId,
      userRole,
      details
    });
  }

  static async logSecurity(action: LogAction, message: string, ipAddress?: string, userAgent?: string, details?: any) {
    await this.log({
      action,
      level: LogLevel.WARN,
      message,
      ipAddress,
      userAgent,
      details
    });
  }

  static async logError(action: LogAction, message: string, error: any, userId?: string, userRole?: string) {
    await this.log({
      action,
      level: LogLevel.ERROR,
      message,
      userId,
      userRole,
      details: { error: error.message, stack: error.stack }
    });
  }
}