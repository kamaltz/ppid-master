// import { prisma } from "../lib/prismaClient"; // Disabled for Prisma migration

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



// GET - Ambil semua permintaan - DISABLED FOR PRISMA MIGRATION
export const getAllPermintaan = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// GET - Ambil permintaan berdasarkan ID - DISABLED FOR PRISMA MIGRATION
export const getPermintaanById = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// POST - Buat permintaan baru (Pemohon only) - DISABLED FOR PRISMA MIGRATION
export const createPermintaan = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// PUT - Update status permintaan (PPID only) - DISABLED FOR PRISMA MIGRATION
export const updateStatusPermintaan = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// DELETE - Hapus permintaan - DISABLED FOR PRISMA MIGRATION
export const deletePermintaan = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};

// GET - Dashboard stats untuk PPID - DISABLED FOR PRISMA MIGRATION
export const getPermintaanStats = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};