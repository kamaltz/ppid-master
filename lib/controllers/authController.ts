// src/controllers/authController.ts
// import { prisma } from "../lib/prismaClient"; // Disabled for Prisma migration
// import bcrypt from "bcryptjs"; // Disabled for Prisma migration
// import jwt from "jsonwebtoken"; // Disabled for Prisma migration

// Define Request and Response types for Next.js API routes
interface Request {
  body: Record<string, unknown>;
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}



export const register = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

export const login = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};
