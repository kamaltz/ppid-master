import { pool } from "../lib/postgresClient";

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
    const query = `
      INSERT INTO requests (pemohon_id, rincian_informasi, tujuan_penggunaan, cara_memperoleh_informasi, cara_mendapat_salinan, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      parseInt(String(userId), 10),
      rincian_informasi,
      tujuan_penggunaan,
      cara_memperoleh_informasi || 'Email',
      cara_mendapat_salinan || 'Email',
      'Diajukan'
    ];

    const result = await pool.query(query, values);
    
    res.status(201).json({ 
      message: "Permintaan berhasil diajukan", 
      data: result.rows[0]
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    console.error('PostgreSQL error:', error);
    res.status(500).json({ error: "Gagal mengajukan permintaan: " + error.message });
  }
};

export const getAllPermintaan = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT * FROM requests 
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.status(200).json({
      data: result.rows,
      count: result.rowCount
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    console.error('PostgreSQL error:', error);
    res.status(500).json({ error: "Gagal mengambil data permintaan: " + error.message });
  }
};