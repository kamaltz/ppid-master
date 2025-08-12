import { Request, Response } from "express";
import { supabase } from "../lib/supabaseClient";
import bcrypt from "bcryptjs";

// GET - Ambil semua users (Admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  const { role, page = 1, limit = 10, search } = req.query as { 
    role?: string; 
    page?: string; 
    limit?: string; 
    search?: string;
  };

  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let allUsers: any[] = [];

    // Ambil dari tabel admin
    const { data: adminUsers } = await supabase
      .from("admin")
      .select("id, email, nama, created_at")
      .order('created_at', { ascending: false });

    if (adminUsers) {
      allUsers.push(...adminUsers.map(user => ({ ...user, role: 'Admin', table: 'admin' })));
    }

    // Ambil dari tabel ppid
    const { data: ppidUsers } = await supabase
      .from("ppid")
      .select("no_pegawai as id, email, nama, role, created_at")
      .order('created_at', { ascending: false });

    if (ppidUsers) {
      allUsers.push(...ppidUsers.map(user => ({ ...user, table: 'ppid' })));
    }

    // Ambil dari tabel atasan_ppid
    const { data: atasanUsers } = await supabase
      .from("atasan_ppid")
      .select("no_pengawas as id, email, nama, created_at")
      .order('created_at', { ascending: false });

    if (atasanUsers) {
      allUsers.push(...atasanUsers.map(user => ({ ...user, role: 'Atasan_PPID', table: 'atasan_ppid' })));
    }

    // Ambil dari tabel pemohon
    const { data: pemohonUsers } = await supabase
      .from("pemohon")
      .select("id, email, nama, created_at")
      .order('created_at', { ascending: false });

    if (pemohonUsers) {
      allUsers.push(...pemohonUsers.map(user => ({ ...user, role: 'Pemohon', table: 'pemohon' })));
    }

    // Filter berdasarkan role jika ada
    if (role) {
      allUsers = allUsers.filter(user => user.role === role);
    }

    // Filter berdasarkan search jika ada
    if (search) {
      allUsers = allUsers.filter(user => 
        user.nama.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by created_at
    allUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Pagination
    const total = allUsers.length;
    const paginatedUsers = allUsers.slice(offset, offset + parseInt(limit));

    res.status(200).json({
      data: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil data users: " + err.message });
  }
};

// POST - Buat user baru (Admin only)
export const createUser = async (req: Request, res: Response) => {
  const { email, password, nama, role, no_telepon, alamat, no_pegawai, no_pengawas } = req.body;

  if (!email || !password || !nama || !role) {
    return res.status(400).json({ 
      error: "Email, password, nama, dan role wajib diisi." 
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let data, error;

    switch (role) {
      case 'Admin':
        ({ data, error } = await supabase
          .from("admin")
          .insert([{ email, hashed_password: hashedPassword, nama }])
          .select()
          .single());
        break;

      case 'PPID':
      case 'PPID_Pelaksana':
        if (!no_pegawai) {
          return res.status(400).json({ error: "No pegawai wajib diisi untuk PPID." });
        }
        ({ data, error } = await supabase
          .from("ppid")
          .insert([{ 
            no_pegawai, 
            email, 
            hashed_password: hashedPassword, 
            nama, 
            role 
          }])
          .select()
          .single());
        break;

      case 'Atasan_PPID':
        if (!no_pengawas) {
          return res.status(400).json({ error: "No pengawas wajib diisi untuk Atasan PPID." });
        }
        ({ data, error } = await supabase
          .from("atasan_ppid")
          .insert([{ 
            no_pengawas, 
            email, 
            hashed_password: hashedPassword, 
            nama 
          }])
          .select()
          .single());
        break;

      case 'Pemohon':
        ({ data, error } = await supabase
          .from("pemohon")
          .insert([{ 
            email, 
            hashed_password: hashedPassword, 
            nama, 
            no_telepon, 
            alamat 
          }])
          .select()
          .single());
        break;

      default:
        return res.status(400).json({ error: "Role tidak valid." });
    }

    if (error) throw error;

    res.status(201).json({ 
      message: "User berhasil dibuat", 
      data: { ...data, role } 
    });
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(400).json({ error: "Email atau ID sudah terdaftar." });
    } else {
      res.status(500).json({ error: "Gagal membuat user: " + err.message });
    }
  }
};

// PUT - Update user (Admin only)
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, nama, no_telepon, alamat, role, table } = req.body;

  try {
    let data, error;
    const updateData: any = { email, nama, updated_at: new Date().toISOString() };

    if (no_telepon) updateData.no_telepon = no_telepon;
    if (alamat) updateData.alamat = alamat;

    switch (table) {
      case 'admin':
        ({ data, error } = await supabase
          .from("admin")
          .update(updateData)
          .eq("id", id)
          .select()
          .single());
        break;

      case 'ppid':
        ({ data, error } = await supabase
          .from("ppid")
          .update({ ...updateData, role })
          .eq("no_pegawai", id)
          .select()
          .single());
        break;

      case 'atasan_ppid':
        ({ data, error } = await supabase
          .from("atasan_ppid")
          .update(updateData)
          .eq("no_pengawas", id)
          .select()
          .single());
        break;

      case 'pemohon':
        ({ data, error } = await supabase
          .from("pemohon")
          .update(updateData)
          .eq("id", id)
          .select()
          .single());
        break;

      default:
        return res.status(400).json({ error: "Tabel tidak valid." });
    }

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    res.status(200).json({ 
      message: "User berhasil diperbarui", 
      data 
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal memperbarui user: " + err.message });
  }
};

// PUT - Reset password user (Admin only)
export const resetUserPassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { table, newPassword = 'ppid321' } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    let data, error;

    switch (table) {
      case 'admin':
        ({ data, error } = await supabase
          .from("admin")
          .update({ hashed_password: hashedPassword })
          .eq("id", id)
          .select("id, email, nama")
          .single());
        break;

      case 'ppid':
        ({ data, error } = await supabase
          .from("ppid")
          .update({ hashed_password: hashedPassword })
          .eq("no_pegawai", id)
          .select("no_pegawai, email, nama")
          .single());
        break;

      case 'atasan_ppid':
        ({ data, error } = await supabase
          .from("atasan_ppid")
          .update({ hashed_password: hashedPassword })
          .eq("no_pengawas", id)
          .select("no_pengawas, email, nama")
          .single());
        break;

      case 'pemohon':
        ({ data, error } = await supabase
          .from("pemohon")
          .update({ hashed_password: hashedPassword })
          .eq("id", id)
          .select("id, email, nama")
          .single());
        break;

      default:
        return res.status(400).json({ error: "Tabel tidak valid." });
    }

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    res.status(200).json({ 
      message: "Password berhasil direset", 
      newPassword 
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal reset password: " + err.message });
  }
};

// DELETE - Hapus user (Admin only)
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { table } = req.body;

  try {
    let error;

    switch (table) {
      case 'admin':
        ({ error } = await supabase.from("admin").delete().eq("id", id));
        break;
      case 'ppid':
        ({ error } = await supabase.from("ppid").delete().eq("no_pegawai", id));
        break;
      case 'atasan_ppid':
        ({ error } = await supabase.from("atasan_ppid").delete().eq("no_pengawas", id));
        break;
      case 'pemohon':
        ({ error } = await supabase.from("pemohon").delete().eq("id", id));
        break;
      default:
        return res.status(400).json({ error: "Tabel tidak valid." });
    }

    if (error) throw error;

    res.status(200).json({ 
      message: "User berhasil dihapus" 
    });
  } catch (err: any) {
    res.status(500).json({ error: "Gagal menghapus user: " + err.message });
  }
};

// GET - Dashboard stats (Admin only)
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Count users
    const [adminCount, ppidCount, atasanCount, pemohonCount] = await Promise.all([
      supabase.from("admin").select("id", { count: 'exact', head: true }),
      supabase.from("ppid").select("no_pegawai", { count: 'exact', head: true }),
      supabase.from("atasan_ppid").select("no_pengawas", { count: 'exact', head: true }),
      supabase.from("pemohon").select("id", { count: 'exact', head: true })
    ]);

    // Count requests and objections
    const [permintaanCount, keberatanCount, informasiCount] = await Promise.all([
      supabase.from("permintaan_informasi").select("id", { count: 'exact', head: true }),
      supabase.from("keberatan").select("id", { count: 'exact', head: true }),
      supabase.from("informasi_publik").select("id", { count: 'exact', head: true })
    ]);

    const stats = {
      users: {
        admin: adminCount.count || 0,
        ppid: ppidCount.count || 0,
        atasan: atasanCount.count || 0,
        pemohon: pemohonCount.count || 0,
        total: (adminCount.count || 0) + (ppidCount.count || 0) + (atasanCount.count || 0) + (pemohonCount.count || 0)
      },
      content: {
        permintaan: permintaanCount.count || 0,
        keberatan: keberatanCount.count || 0,
        informasi: informasiCount.count || 0
      }
    };

    res.status(200).json(stats);
  } catch (err: any) {
    res.status(500).json({ error: "Gagal mengambil statistik: " + err.message });
  }
};