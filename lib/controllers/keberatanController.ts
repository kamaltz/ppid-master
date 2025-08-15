import { supabase } from "../lib/supabaseClient";

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

// GET - Ambil semua keberatan
export const getAllKeberatan = async (req: Request, res: Response) => {
  const { status, page = 1, limit = 10 } = req.query as { 
    status?: string; 
    page?: string; 
    limit?: string; 
  };
  const { userId, role } = req.user || { userId: '', role: '' };

  try {
    let query = supabase
      .from("keberatan")
      .select(`
        *,
        pemohon:pemohon_id(nama, email),
        permintaan:permintaan_id(rincian_informasi)
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
    res.status(500).json({ error: "Gagal mengambil data keberatan: " + error.message });
  }
};

// GET - Ambil keberatan berdasarkan ID
export const getKeberatanById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user || { userId: '', role: '' };

  try {
    let query = supabase
      .from("keberatan")
      .select(`
        *,
        pemohon:pemohon_id(nama, email, no_telepon, alamat),
        permintaan:permintaan_id(rincian_informasi, status)
      `)
      .eq("id", id);

    // Pemohon hanya bisa melihat keberatan miliknya
    if (role === 'Pemohon') {
      query = query.eq('pemohon_id', userId);
    }

    const { data, error } = await query.single();
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Keberatan tidak ditemukan" });
    }

    res.status(200).json(data);
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal mengambil keberatan: " + error.message });
  }
};

// POST - Buat keberatan baru (Pemohon only)
export const createKeberatan = async (req: Request, res: Response) => {
  const { 
    permintaan_id, 
    alasan_keberatan, 
    kasus_posisi 
  } = req.body;
  const { userId } = req.user || { userId: '' };

  if (!permintaan_id || !alasan_keberatan) {
    return res.status(400).json({ 
      error: "ID permintaan dan alasan keberatan wajib diisi." 
    });
  }

  try {
    // Cek apakah permintaan ada dan milik pemohon
    const { data: permintaan, error: permintaanError } = await supabase
      .from("permintaan_informasi")
      .select("*")
      .eq("id", permintaan_id)
      .eq("pemohon_id", userId)
      .single();

    if (permintaanError || !permintaan) {
      return res.status(404).json({ error: "Permintaan tidak ditemukan atau bukan milik Anda" });
    }

    // Cek apakah sudah ada keberatan untuk permintaan ini
    const { data: existingKeberatan } = await supabase
      .from("keberatan")
      .select("id")
      .eq("permintaan_id", permintaan_id)
      .single();

    if (existingKeberatan) {
      return res.status(400).json({ error: "Keberatan untuk permintaan ini sudah ada" });
    }

    const { data, error } = await supabase
      .from("keberatan")
      .insert([{
        pemohon_id: userId,
        permintaan_id,
        alasan_keberatan,
        kasus_posisi,
        status: 'Diajukan',
        tanggal_keberatan: new Date().toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ 
      message: "Keberatan berhasil diajukan", 
      data 
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal mengajukan keberatan: " + error.message });
  }
};

// PUT - Update status keberatan (Atasan PPID only)
export const updateStatusKeberatan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, tanggapan_atasan } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status wajib diisi." });
  }

  try {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (tanggapan_atasan) updateData.tanggapan_atasan = tanggapan_atasan;

    // Set tanggal sesuai status
    if (status === 'Diproses') {
      updateData.tanggal_diproses = new Date().toISOString();
    } else if (status === 'Selesai') {
      updateData.tanggal_selesai = new Date().toISOString();
    } else if (status === 'Ditolak') {
      updateData.tanggal_ditolak = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("keberatan")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "Keberatan tidak ditemukan" });
    }

    res.status(200).json({ 
      message: "Status keberatan berhasil diperbarui", 
      data 
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal memperbarui status: " + error.message });
  }
};

// DELETE - Hapus keberatan (Admin only atau Pemohon untuk keberatan miliknya yang masih 'Diajukan')
export const deleteKeberatan = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, role } = req.user || { userId: '', role: '' };

  try {
    let query = supabase.from("keberatan").select("*").eq("id", id);
    
    // Pemohon hanya bisa hapus keberatan miliknya yang masih 'Diajukan'
    if (role === 'Pemohon') {
      query = query.eq('pemohon_id', userId).eq('status', 'Diajukan');
    }

    const { data: existingData, error: selectError } = await query.single();
    if (selectError || !existingData) {
      return res.status(404).json({ error: "Keberatan tidak ditemukan atau tidak dapat dihapus" });
    }

    const { error } = await supabase
      .from("keberatan")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ 
      message: "Keberatan berhasil dihapus" 
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal menghapus keberatan: " + error.message });
  }
};

// GET - Dashboard stats untuk Atasan PPID
export const getKeberatanStats = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("keberatan")
      .select("status");

    if (error) throw error;

    const stats = {
      total: data.length,
      diajukan: data.filter(k => k.status === 'Diajukan').length,
      diproses: data.filter(k => k.status === 'Diproses').length,
      selesai: data.filter(k => k.status === 'Selesai').length,
      ditolak: data.filter(k => k.status === 'Ditolak').length
    };

    res.status(200).json(stats);
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Gagal mengambil statistik: " + error.message });
  }
};