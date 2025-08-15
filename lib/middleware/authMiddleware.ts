import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface JwtPayload {
  userId: string | number;
  email: string;
  role: string;
}

interface User {
  userId: string | number;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

// Helper untuk Next.js API Routes
export const getAuthUser = (request: NextRequest): User | null => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
  } catch {
    return null;
  }
};

type HandlerFunction = (request: AuthenticatedRequest, context?: unknown) => Promise<NextResponse> | NextResponse;

export const requireAuth = (handler: HandlerFunction) => {
  return async (request: NextRequest, context?: unknown) => {
    const user = getAuthUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Token akses diperlukan" },
        { status: 401 }
      );
    }

    // Add user to request object
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;
    
    return handler(authenticatedRequest, context);
  };
};

export const requireRole = (allowedRoles: string[]) => {
  return (handler: HandlerFunction) => {
    return async (request: NextRequest, context?: unknown) => {
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
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = user;
      
      return handler(authenticatedRequest, context);
    };
  };
};