// src/controllers/authController.ts
import { supabase } from "../lib/supabaseClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Define Request and Response types for Next.js API routes
interface Request {
  body: Record<string, unknown>;
}

interface Response {
  status: (code: number) => Response;
  json: (data: unknown) => void;
}

interface User {
  id?: number;
  no_pegawai?: string;
  no_pengawas?: string;
  email: string;
  hashed_password: string;
  nama: string;
  role?: string;
}

interface ErrorWithMessage extends Error {
  message: string;
}

export const register = async (req: Request, res: Response) => {
  const { email, password, nama, no_telepon, alamat } = req.body;
  
  if (!email || !password || !nama) {
    return res.status(400).json({ error: "Email, password, dan nama wajib diisi." });
  }

  try {
    // Cek apakah email sudah terdaftar
    const { data: existingUser } = await supabase
      .from("pemohon")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password as string, 10);

    // Insert pemohon baru
    const { data, error } = await supabase
      .from("pemohon")
      .insert({
        email,
        hashed_password: hashedPassword,
        nama,
        no_telepon,
        alamat
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: "Gagal mendaftarkan pemohon." });
    }

    res.status(201).json({ 
      message: "Registrasi berhasil", 
      data: { id: data.id, email: data.email, nama: data.nama } 
    });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res.status(500).json({ error: "Terjadi kesalahan pada server: " + error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  try {
    let user: User | null = null;
    let role: string = "";
    let userId: string | number = "";

    // 1. Cek di tabel admin
    const { data: adminUser } = await supabase
      .from("admin")
      .select("*")
      .eq("email", email)
      .single();
    if (adminUser) {
      user = adminUser;
      role = "Admin";
      userId = adminUser.id;
    }

    // 2. Jika bukan admin, cek di tabel ppid (PPID Utama & Pelaksana)
    if (!user) {
      const { data: ppidUser } = await supabase
        .from("ppid")
        .select("*")
        .eq("email", email)
        .single();
      if (ppidUser) {
        user = ppidUser;
        role = ppidUser.role || "PPID"; // Default ke PPID jika role tidak ada
        userId = ppidUser.no_pegawai;
      }
    }

    // 3. Jika bukan juga, cek di tabel atasan_ppid
    if (!user) {
      const { data: atasanUser } = await supabase
        .from("atasan_ppid")
        .select("*")
        .eq("email", email)
        .single();
      if (atasanUser) {
        user = atasanUser;
        role = "Atasan_PPID";
        userId = atasanUser.no_pengawas;
      }
    }

    // 4. Terakhir, cek di tabel pemohon
    if (!user) {
      const { data: pemohonUser, error: pemohonError } = await supabase
        .from("pemohon")
        .select("*")
        .eq("email", email)
        .single();
      if (pemohonUser && !pemohonError) {
        user = pemohonUser;
        role = "Pemohon";
        userId = pemohonUser.id;
      }
    }

    if (!user) {
      return res
        .status(404)
        .json({ error: "Pengguna dengan email tersebut tidak ditemukan." });
    }

    const isPasswordValid = await bcrypt.compare(
      password as string,
      user.hashed_password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password salah." });
    }

    const token = jwt.sign(
      { userId, email: user.email, role },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    res.status(200).json({ message: "Login berhasil", token });
  } catch (err: unknown) {
    const error = err as ErrorWithMessage;
    res
      .status(500)
      .json({ error: "Terjadi kesalahan pada server: " + error.message });
  }
};
