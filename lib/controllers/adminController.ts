// import { supabase } from "../lib/supabaseClient"; // Disabled for Prisma migration
// import bcrypt from "bcryptjs"; // Disabled for Prisma migration

// Define Request and Response types for Next.js API routes
interface Request {
  query: Record<string, string | string[] | undefined>;
  body: Record<string, unknown>;
  params: Record<string, string>;
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}





// GET - Ambil semua users (Admin only) - DISABLED FOR PRISMA MIGRATION
export const getAllUsers = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// POST - Buat user baru (Admin only) - DISABLED FOR PRISMA MIGRATION
export const createUser = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// PUT - Update user (Admin only) - DISABLED FOR PRISMA MIGRATION
export const updateUser = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// PUT - Reset password user (Admin only) - DISABLED FOR PRISMA MIGRATION
export const resetUserPassword = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// DELETE - Hapus user (Admin only) - DISABLED FOR PRISMA MIGRATION
export const deleteUser = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// GET - Dashboard stats (Admin only) - DISABLED FOR PRISMA MIGRATION
export const getDashboardStats = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};