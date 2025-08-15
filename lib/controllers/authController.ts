// src/controllers/authController.ts
import { prisma } from "../lib/prismaClient";
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
  id: number;
  email: string;
  password: string;
  nama: string;
  role: string;
  noTelepon?: string;
  alamat?: string;
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
    const existingUser = await prisma.user.findUnique({
      where: { email: email as string }
    });

    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password as string, 10);

    // Insert pemohon baru
    const newUser = await prisma.user.create({
      data: {
        email: email as string,
        password: hashedPassword,
        nama: nama as string,
        noTelepon: no_telepon as string,
        alamat: alamat as string,
        role: 'PEMOHON'
      }
    });

    res.status(201).json({ 
      message: "Registrasi berhasil", 
      data: { id: newUser.id, email: newUser.email, nama: newUser.nama } 
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
    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: email as string }
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Pengguna dengan email tersebut tidak ditemukan." });
    }

    const isPasswordValid = await bcrypt.compare(
      password as string,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password salah." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
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
