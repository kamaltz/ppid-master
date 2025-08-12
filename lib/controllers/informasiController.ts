import { Request, Response } from "express";
import { supabase } from "../lib/supabaseClient";

// GET - Ambil semua informasi publik
export const getAllInformasi = async (req: Request, res: Response) => {
  const { klasifikasi, search, page = 1, limit = 10 } = req.query as { 
    klasifikasi?: string; 
    search?: string; 
    page?: string; 
    limit?: string; 
  };

  try {
    let query = supabase
      .from("informasi_publik")
      .select("*", { count: 'exact' })
      .order('created_at', { ascending: false });

    if (klasifikasi) {
      query = query.eq("klasifikasi", klasifikasi);
    }

    if (search) {
      query = query.or(`judul.ilike.%${search}%,ringkasan_isi_informasi.ilike.%${search}%`);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.status(200).json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / parseInt(limit))
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data informasi: " + err.message });
  }
};

// GET - Ambil informasi berdasarkan ID
export const getInformasiById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("informasi_publik")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Informasi tidak ditemukan" });
    }

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil informasi: " + err.message });
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
    const { data, error } = await supabase
      .from("informasi_publik")
      .insert([{
        judul,
        klasifikasi,
        ringkasan_isi_informasi,
        file_url,
        pejabat_penguasa_informasi,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ 
      message: "Informasi berhasil ditambahkan", 
      data 
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menambahkan informasi: " + err.message });
  }
};

// PUT - Update informasi (PPID only)
export const updateInformasi = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { judul, klasifikasi, ringkasan_isi_informasi, file_url, pejabat_penguasa_informasi } = req.body;

  try {
    const { data, error } = await supabase
      .from("informasi_publik")
      .update({
        judul,
        klasifikasi,
        ringkasan_isi_informasi,
        file_url,
        pejabat_penguasa_informasi,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Informasi tidak ditemukan" });
    }

    res.status(200).json({ 
      message: "Informasi berhasil diperbarui", 
      data 
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal memperbarui informasi: " + err.message });
  }
};

// DELETE - Hapus informasi (PPID only)
export const deleteInformasi = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("informasi_publik")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Informasi tidak ditemukan" });
    }

    res.status(200).json({ 
      message: "Informasi berhasil dihapus" 
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menghapus informasi: " + err.message });
  }
};