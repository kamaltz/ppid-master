import { Request, Response } from "express";
import { pool } from "../lib/postgresClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email dan password wajib diisi." });
  }

  try {
    let user: any = null;
    let role: string = "";
    let userId: string | number = "";

    // Check admin
    const adminResult = await pool.query('SELECT * FROM admin WHERE email = $1', [email]);
    if (adminResult.rows.length > 0) {
      user = adminResult.rows[0];
      role = "Admin";
      userId = user.id;
    }

    // Check PPID
    if (!user) {
      const ppidResult = await pool.query('SELECT * FROM ppid WHERE email = $1', [email]);
      if (ppidResult.rows.length > 0) {
        user = ppidResult.rows[0];
        role = user.role || "PPID";
        userId = user.id;
      }
    }

    // Check pemohon
    if (!user) {
      const pemohonResult = await pool.query('SELECT * FROM pemohon WHERE email = $1', [email]);
      if (pemohonResult.rows.length > 0) {
        user = pemohonResult.rows[0];
        role = "Pemohon";
        userId = user.id;
      }
    }

    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Password salah." });
    }

    const token = jwt.sign(
      { userId, email: user.email, role },
      process.env.JWT_SECRET as string,
      { expiresIn: "8h" }
    );

    res.status(200).json({ message: "Login berhasil", token });
  } catch (err: any) {
    res.status(500).json({ error: "Terjadi kesalahan pada server: " + err.message });
  }
};