import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string | number;
    email: string;
    role: string;
  };
}

// Middleware untuk Express (untuk referensi)
export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: "Token akses diperlukan" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: "Token tidak valid" });
  }
};

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "User tidak terautentikasi" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Akses ditolak. Role tidak memiliki izin." });
    }

    next();
  };
};

// Helper untuk Next.js API Routes
export const getAuthUser = (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    return null;
  }
};

export const requireAuth = (handler: Function) => {
  return async (request: NextRequest, context?: any) => {
    const user = getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Token akses diperlukan" },
        { status: 401 }
      );
    }

    // Add user to request object
    (request as any).user = user;
    
    return handler(request, context);
  };
};

export const requireRole = (allowedRoles: string[]) => {
  return (handler: Function) => {
    return async (request: NextRequest, context?: any) => {
      const user = getAuthUser(request);
      
      if (!user) {
        return NextResponse.json(
          { error: "User tidak terautentikasi" },
          { status: 401 }
        );
      }

      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          { error: "Akses ditolak. Role tidak memiliki izin." },
          { status: 403 }
        );
      }

      // Add user to request object
      (request as any).user = user;
      
      return handler(request, context);
    };
  };
};