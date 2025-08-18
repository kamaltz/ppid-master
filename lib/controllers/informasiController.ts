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

interface ErrorWithMessage extends Error {
  message: string;
}

// GET - Ambil semua informasi publik
export const getAllInformasi = async (req: Request, res: Response) => {
  const { klasifikasi, search, page = 1, limit = 10 } = req.query as { 
    klasifikasi?: string; 
    search?: string; 
    page?: string; 
    limit?: string; 
  };

  try {
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {};
    
    if (klasifikasi) {
      where.klasifikasi = klasifikasi;
    }

    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { ringkasanIsiInformasi: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [data, count] = await Promise.all([
      prisma.informasiPublik.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.informasiPublik.count({ where })
    ]);

    res.status(200).json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count,
        totalPages: Math.ceil(count / limitNum)
      }
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal mengambil data informasi: " + error.message });
  }
};

// GET - Ambil informasi berdasarkan ID
export const getInformasiById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = await prisma.informasiPublik.findUnique({
      where: { id: parseInt(id) }
    });

    if (!data) {
      return res.status(404).json({ error: "Informasi tidak ditemukan" });
    }

    res.status(200).json(data);
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal mengambil informasi: " + error.message });
  }
};

// POST - Buat informasi baru (PPID only)
export const createInformasi = async (req: Request, res: Response) => {
  const { judul, klasifikasi, ringkasan_isi_informasi, file_url, pejabat_penguasa_informasi } = req.body;
  
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
        file_attachments: file_url as string,
        pejabat_penguasa_informasi: pejabat_penguasa_informasi as string
      }
    });

    res.status(201).json({ 
      message: "Informasi berhasil ditambahkan", 
      data 
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal menambahkan informasi: " + error.message });
  }
};

// PUT - Update informasi (PPID only)
export const updateInformasi = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { judul, klasifikasi, ringkasan_isi_informasi, file_url, pejabat_penguasa_informasi } = req.body;

  try {
    const data = await prisma.informasiPublik.update({
      where: { id: parseInt(id) },
      data: {
        judul: judul as string,
        klasifikasi: klasifikasi as string,
        ringkasan_isi_informasi: ringkasan_isi_informasi as string,
        file_attachments: file_url as string,
        pejabat_penguasa_informasi: pejabat_penguasa_informasi as string,
        updated_at: new Date()
      }
    });

    res.status(200).json({ 
      message: "Informasi berhasil diperbarui", 
      data 
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    if (error.message.includes('Record to update not found')) {
      return res.status(404).json({ error: "Informasi tidak ditemukan" });
    }
    res.status(500).json({ error: "Gagal memperbarui informasi: " + error.message });
  }
};

// DELETE - Hapus informasi (PPID only)
export const deleteInformasi = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.informasiPublik.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ 
      message: "Informasi berhasil dihapus" 
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    if (error.message.includes('Record to delete does not exist')) {
      return res.status(404).json({ error: "Informasi tidak ditemukan" });
    }
    res.status(500).json({ error: "Gagal menghapus informasi: " + error.message });
  }
};