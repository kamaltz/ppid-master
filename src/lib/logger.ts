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
  message: string;
  userId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string | object | null;
  resource?: string;
}

export class Logger {
  static async log(data: LogData) {
    try {
      await prisma.activityLog.create({
        data: {
          action: data.action,
          resource: data.resource || null,
          details: data.details ? (typeof data.details === 'string' ? data.details : JSON.stringify(data.details)) : null,
          user_id: data.userId || null,
          user_role: data.userRole || null,
          ip_address: data.ipAddress || null,
          user_agent: data.userAgent || null
        }
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  static async logAuth(action: LogAction, email: string, success: boolean, ipAddress?: string, userAgent?: string, details?: string | object) {
    await this.log({
      action,
      message: success ? `${action} successful for ${email}` : `${action} failed for ${email}`,
      ipAddress,
      userAgent,
      details
    });
  }

  static async logUserAction(action: LogAction, userId: string, userRole: string, message: string, ipAddress?: string, details?: string | object) {
    await this.log({
      action,
      message,
      userId,
      userRole,
      ipAddress,
      details
    });
  }

  static async logSystemAction(action: LogAction, message: string, userId?: string, userRole?: string, details?: string | object) {
    await this.log({
      action,
      message,
      userId,
      userRole,
      details
    });
  }

  static async logSecurity(action: LogAction, message: string, ipAddress?: string, userAgent?: string, details?: string | object) {
    await this.log({
      action,
      message,
      ipAddress,
      userAgent,
      details
    });
  }

  static async logError(action: LogAction, message: string, error: Error, userId?: string, userRole?: string) {
    await this.log({
      action,
      message,
      userId,
      userRole,
      details: { error: error.message, stack: error.stack }
    });
  }
}