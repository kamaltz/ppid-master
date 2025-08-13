import { Request, Response } from "express";
import { prisma } from "../lib/prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface UserResult {
  id: number;
  email: string;
  hashed_password: string;
  nama: string;
  role: string;
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "JWT secret tidak dikonfigurasi." });
  }

  try {
    // Find user across all tables
    const [adminUser, ppidUser, pemohonUser] = await Promise.all([
      prisma.admin.findUnique({ where: { email } }),
      prisma.ppid.findUnique({ where: { email } }),
      prisma.pemohon.findUnique({ where: { email } })
    ]);

    let user: UserResult | null = null;

    if (adminUser) {
      user = { ...adminUser, role: "Admin" };
    } else if (ppidUser) {
      user = { ...ppidUser, role: ppidUser.role || "PPID" };
    } else if (pemohonUser) {
      user = { ...pemohonUser, role: "Pemohon" };
    }

    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password salah." });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        nama: user.nama
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({ 
      message: "Login berhasil", 
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};