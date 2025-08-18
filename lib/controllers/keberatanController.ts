// import { supabase } from "../lib/supabaseClient"; // Disabled for Prisma migration

// Define Request and Response types for Next.js API routes
interface Request {
  query: Record<string, string | string[] | undefined>;
  body: Record<string, unknown>;
  params: Record<string, string>;
  user?: {
    userId: string | number;
    role: string;
  };
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}



// GET - Ambil semua keberatan - DISABLED FOR PRISMA MIGRATION
export const getAllKeberatan = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// GET - Ambil keberatan berdasarkan ID - DISABLED FOR PRISMA MIGRATION
export const getKeberatanById = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// POST - Buat keberatan baru (Pemohon only) - DISABLED FOR PRISMA MIGRATION
export const createKeberatan = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// PUT - Update status keberatan (Atasan PPID only) - DISABLED FOR PRISMA MIGRATION
export const updateStatusKeberatan = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// DELETE - Hapus keberatan - DISABLED FOR PRISMA MIGRATION
export const deleteKeberatan = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// GET - Dashboard stats untuk Atasan PPID - DISABLED FOR PRISMA MIGRATION
export const getKeberatanStats = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};