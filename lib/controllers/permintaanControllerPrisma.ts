import { prisma } from "../lib/prismaClient";

// Define Request and Response types for Next.js API routes
interface Request {
  body: Record<string, unknown>;
  user?: {
    userId: string | number;
    role: string;
  };
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}

interface ErrorWithMessage extends Error {
  message: string;
}

export const createPermintaan = async (req: Request, res: Response) => {
  const { 
    rincian_informasi, 
    tujuan_penggunaan, 
    cara_memperoleh_informasi, 
    cara_mendapat_salinan 
  } = req.body;
  const { userId } = req.user || { userId: '' };

  if (!rincian_informasi || !tujuan_penggunaan) {
    return res.status(400).json({ 
      error: "Rincian informasi dan tujuan penggunaan wajib diisi." 
    });
  }

  try {
    const request = await prisma.request.create({
      data: {
        pemohon_id: parseInt(String(userId), 10),
        rincian_informasi: rincian_informasi as string,
        tujuan_penggunaan: tujuan_penggunaan as string,
        cara_memperoleh_informasi: (cara_memperoleh_informasi as string) || 'Email',
        cara_mendapat_salinan: (cara_mendapat_salinan as string) || 'Email',
        status: 'Diajukan'
      }
    });
    
    res.status(201).json({ 
      message: "Permintaan berhasil diajukan", 
      data: request
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    console.error('Prisma error:', error);
    res.status(500).json({ error: "Gagal mengajukan permintaan: " + error.message });
  }
};

export const getAllPermintaan = async (req: Request, res: Response) => {
  try {
    const requests = await prisma.request.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    res.status(200).json({
      data: requests,
      count: requests.length
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    console.error('Prisma error:', error);
    res.status(500).json({ error: "Gagal mengambil data permintaan: " + error.message });
  }
};