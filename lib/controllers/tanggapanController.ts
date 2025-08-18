// import { supabase } from "../lib/supabaseClient"; // Disabled for Prisma migration

// Define Request and Response types for Next.js API routes
interface Request {
  body: Record<string, unknown>;
  params: Record<string, string>;
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}



/**
 * Menambahkan tanggapan atas keberatan - DISABLED FOR PRISMA MIGRATION
 * (Atasan PPID Only)
 */
export const createTanggapan = async (req: Request, res: Response) => {
  res.status(501).json({ error: "Function disabled during Prisma migration" });
};
