import { Request, Response } from "express";
import { supabase } from "../lib/supabaseClient";

// GET - Ambil semua permintaan (Admin/PPID dapat melihat semua, Pemohon hanya miliknya)
export const getAllPermintaan = async (req: Request, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query as { 
    status?: string; 
    page?: string; 
    limit?: string; 
  };
  const { userId, role } = (req as any).user;

  try {
    let query = supabase
      .from("permintaan_informasi")
      .select(`
        *,
        pemohon:pemohon_id(nama, email)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter berdasarkan role
    if (role === 'Pemohon') {
      query = query.eq('pemohon_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
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
    res.status(500).json({ error: "Gagal mengambil data permintaan: " + err.message });
  }
};

// GET - Ambil permintaan berdasarkan ID
export const getPermintaanById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = (req as any).user;

  try {
    let query = supabase
      .from("permintaan_informasi")
      .select(`
        *,
        pemohon:pemohon_id(nama, email, no_telepon, alamat)
      `)
      .eq("id", id);

    // Pemohon hanya bisa melihat permintaan miliknya
    if (role === 'Pemohon') {
      query = query.eq('pemohon_id', userId);
    }

    const { data, error } = await query.single();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Permintaan tidak ditemukan" });
    }

    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil permintaan: " + err.message });
  }
};

// POST - Buat permintaan baru (Pemohon only)
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
    const { data, error } = await supabase
      .from("permintaan_informasi")
      .insert([{
        pemohon_id: userId,
        rincian_informasi,
        tujuan_penggunaan,
        cara_memperoleh_informasi,
        cara_mendapat_salinan,
        status: 'Diajukan',
        tanggal_permintaan: new Date().toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ 
      message: "Permintaan berhasil diajukan", 
      data 
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengajukan permintaan: " + err.message });
  }
};

// PUT - Update status permintaan (PPID only)
export const updateStatusPermintaan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, catatan_ppid, estimasi_waktu, biaya } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status wajib diisi." });
  }

  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (catatan_ppid) updateData.catatan_ppid = catatan_ppid;
    if (estimasi_waktu) updateData.estimasi_waktu = estimasi_waktu;
    if (biaya !== undefined) updateData.biaya = biaya;

    // Set tanggal sesuai status
    if (status === 'Diproses') {
      updateData.tanggal_diproses = new Date().toISOString();
    } else if (status === 'Selesai') {
      updateData.tanggal_selesai = new Date().toISOString();
    } else if (status === 'Ditolak') {
      updateData.tanggal_ditolak = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("permintaan_informasi")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Permintaan tidak ditemukan" });
    }

    res.status(200).json({ 
      message: "Status permintaan berhasil diperbarui", 
      data 
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal memperbarui status: " + err.message });
  }
};

// DELETE - Hapus permintaan (Admin only atau Pemohon untuk permintaan miliknya yang masih 'Diajukan')
export const deletePermintaan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = (req as any).user;

  try {
    let query = supabase.from("permintaan_informasi").select("*").eq("id", id);
    
    // Pemohon hanya bisa hapus permintaan miliknya yang masih 'Diajukan'
    if (role === 'Pemohon') {
      query = query.eq('pemohon_id', userId).eq('status', 'Diajukan');
    }

    const { data: existingData, error: selectError } = await query.single();
    if (selectError || !existingData) {
      return res.status(404).json({ error: "Permintaan tidak ditemukan atau tidak dapat dihapus" });
    }

    const { error } = await supabase
      .from("permintaan_informasi")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ 
      message: "Permintaan berhasil dihapus" 
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menghapus permintaan: " + err.message });
  }
};

// GET - Dashboard stats untuk PPID
export const getPermintaanStats = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("permintaan_informasi")
      .select("status");

    if (error) throw error;

    const stats = {
      total: data.length,
      diajukan: data.filter(p => p.status === 'Diajukan').length,
      diproses: data.filter(p => p.status === 'Diproses').length,
      selesai: data.filter(p => p.status === 'Selesai').length,
      ditolak: data.filter(p => p.status === 'Ditolak').length
    };

    res.status(200).json(stats);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil statistik: " + err.message });
  }
};