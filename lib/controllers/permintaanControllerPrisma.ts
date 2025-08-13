import { Request, Response } from "express";
import { prisma } from "../lib/prismaClient";

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
    const request = await prisma.request.create({
      data: {
        pemohon_id: parseInt(userId),
        rincian_informasi,
        tujuan_penggunaan,
        cara_memperoleh_informasi: cara_memperoleh_informasi || 'Email',
        cara_mendapat_salinan: cara_mendapat_salinan || 'Email',
        status: 'Diajukan'
      }
    });
    
    res.status(201).json({ 
      message: "Permintaan berhasil diajukan", 
      data: request
    });
  } catch (err: any) {
    console.error('Prisma error:', err);
    res.status(500).json({ error: "Gagal mengajukan permintaan: " + err.message });
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
  } catch (err: any) {
    console.error('Prisma error:', err);
    res.status(500).json({ error: "Gagal mengambil data permintaan: " + err.message });
  }
};