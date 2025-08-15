import { prisma } from "../lib/prismaClient";

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

interface ErrorWithMessage extends Error {
  message: string;
}

// GET - Ambil semua permintaan (Admin/PPID dapat melihat semua, Pemohon hanya miliknya)
export const getAllPermintaan = async (req: Request, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query as { 
    status?: string; 
    page?: string; 
    limit?: string; 
  };
  const { userId, role } = req.user || { userId: '', role: '' };

  try {
    let query = supabase
      .from("requests")
      .select(`
        *
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter berdasarkan role
    if (role === 'Pemohon') {
      query = query.eq('pemohon_id', userId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const offset = (pageNum - 1) * limitNum;
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    res.status(200).json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal mengambil data permintaan: " + error.message });
  }
};

// GET - Ambil permintaan berdasarkan ID
export const getPermintaanById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user || { userId: '', role: '' };

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
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal mengambil permintaan: " + error.message });
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
  const { userId } = req.user || { userId: '' };

  console.log('Creating permintaan:', { userId, body: req.body });

  if (!rincian_informasi || !tujuan_penggunaan) {
    return res.status(400).json({ 
      error: "Rincian informasi dan tujuan penggunaan wajib diisi." 
    });
  }

  try {
    // Direct insert without foreign key constraints
    const { data, error } = await supabase
      .from('requests')
      .insert({
        pemohon_id: parseInt(String(userId), 10),
        rincian_informasi,
        tujuan_penggunaan,
        cara_memperoleh_informasi: cara_memperoleh_informasi || 'Email',
        cara_mendapat_salinan: cara_mendapat_salinan || 'Email',
        status: 'Diajukan'
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw new Error(`Insert failed: ${error.message || 'Unknown error'}`);
    }
    
    console.log('Permintaan created successfully:', data);
    res.status(201).json({ 
      message: "Permintaan berhasil diajukan", 
      data 
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    console.error('createPermintaan controller error:', error);
    res.status(500).json({ error: "Gagal mengajukan permintaan: " + (error?.message || 'Unknown error') });
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
    const updateData: Record<string, unknown> = {
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
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal memperbarui status: " + error.message });
  }
};

// DELETE - Hapus permintaan (Admin only atau Pemohon untuk permintaan miliknya yang masih 'Diajukan')
export const deletePermintaan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user || { userId: '', role: '' };

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
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal menghapus permintaan: " + error.message });
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
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal mengambil statistik: " + error.message });
  }
};