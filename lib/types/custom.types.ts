import { NextRequest } from 'next/server';

// Interface untuk payload JWT yang akan disimpan di request
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Memperluas tipe NextRequest untuk menyertakan properti 'user'
export interface AuthenticatedRequest extends NextRequest {
  user?: JwtPayload;
}