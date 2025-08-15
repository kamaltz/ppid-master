import { prisma } from "../lib/prismaClient";

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

interface WhereClause {
  klasifikasi?: string;
  OR?: Array<{
    judul?: { contains: string; mode: 'insensitive' };
    ringkasan_isi_informasi?: { contains: string; mode: 'insensitive' };
  }>;
}

interface ErrorWithMessage extends Error {
  message: string;
}

export const getAllInformasi = async (req: Request, res: Response) => {
  const { klasifikasi, search, page = "1", limit = "10" } = req.query as { 
    klasifikasi?: string; 
    search?: string; 
    page?: string; 
    limit?: string; 
  };

  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const where: WhereClause = {};
    
    if (klasifikasi) {
      where.klasifikasi = klasifikasi;
    }

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { ringkasan_isi_informasi: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [data, total] = await Promise.all([
      prisma.informasiPublik.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limitNum
      }),
      prisma.informasiPublik.count({ where })
    ]);

    res.status(200).json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    console.error('Get informasi error:', error);
    res.status(500).json({ error: "Gagal mengambil data informasi." });
  }
};

export const createInformasi = async (req: Request, res: Response) => {
  const { judul, klasifikasi, ringkasan_isi_informasi, pejabat_penguasa_informasi } = req.body;
  
  if (!judul || !klasifikasi || !ringkasan_isi_informasi) {
    return res.status(400).json({ 
      error: "Judul, klasifikasi, dan ringkasan isi informasi wajib diisi." 
    });
  }

  try {
    const data = await prisma.informasiPublik.create({
      data: {
        judul: judul as string,
        klasifikasi: klasifikasi as string,
        ringkasan_isi_informasi: ringkasan_isi_informasi as string,
        pejabat_penguasa_informasi: pejabat_penguasa_informasi as string | undefined
      }
    });

    res.status(201).json({ 
      message: "Informasi berhasil ditambahkan", 
      data 
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    console.error('Create informasi error:', error);
    res.status(500).json({ error: "Gagal menambahkan informasi." });
  }
};