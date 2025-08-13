import { Request, Response } from "express";
import { pool } from "../lib/postgresClient";

export const createPermintaan = async (req: Request, res: Response) => {
  const { 
    rincian_informasi, 
    tujuan_penggunaan, 
    cara_memperoleh_informasi, 
    cara_mendapat_salinan 
  } = req.body;
  const { userId } = (req as any).user;

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
      parseInt(userId),
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
  } catch (err: any) {
    console.error('PostgreSQL error:', err);
    res.status(500).json({ error: "Gagal mengajukan permintaan: " + err.message });
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
  } catch (err: any) {
    console.error('PostgreSQL error:', err);
    res.status(500).json({ error: "Gagal mengambil data permintaan: " + err.message });
  }
};