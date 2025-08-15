import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

let adminToken;
let pemohonToken;
let testPemohonId;
let testKeberatanId;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('testpass', 10);
  
  // Clean up first - handle foreign key constraints
  try {
    const existingPemohon = await prisma.pemohon.findFirst({ where: { email: 'test-keberatan-pemohon@test.com' } });
    if (existingPemohon) {
      await prisma.keberatan.deleteMany({ where: { pemohon_id: existingPemohon.id } });
      await prisma.request.deleteMany({ where: { pemohon_id: existingPemohon.id } });
      await prisma.pemohon.deleteMany({ where: { email: 'test-keberatan-pemohon@test.com' } });
    }
    await prisma.admin.deleteMany({ where: { email: 'test-keberatan-admin@test.com' } });
  } catch (error) {
    // Ignore cleanup errors
  }
  
  const admin = await prisma.admin.create({
    data: {
      email: 'test-keberatan-admin@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Admin Keberatan'
    }
  });
  
  adminToken = jwt.sign(
    { userId: admin.id, role: 'Admin', userType: 'admin' },
    process.env.JWT_SECRET
  );
  
  const pemohon = await prisma.pemohon.create({
    data: {
      email: 'test-keberatan-pemohon@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Pemohon Keberatan',
      nik: '1234567890123456',
      no_telepon: '081234567890',
      alamat: 'Test Address'
    }
  });
  
  testPemohonId = pemohon.id;
  pemohonToken = jwt.sign(
    { userId: pemohon.id, role: 'Pemohon', userType: 'pemohon' },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  // Delete in correct order to handle foreign key constraints
  await prisma.keberatan.deleteMany({ where: { pemohon_id: testPemohonId } });
  await prisma.request.deleteMany({ where: { pemohon_id: testPemohonId } });
  await prisma.pemohon.deleteMany({ where: { email: 'test-keberatan-pemohon@test.com' } });
  await prisma.admin.deleteMany({ where: { email: 'test-keberatan-admin@test.com' } });
  await prisma.$disconnect();
});

describe('Keberatan API Tests', () => {
  
  test('POST /api/keberatan - Create new keberatan', async () => {
    const keberatanData = {
      alasan_keberatan: 'Test alasan keberatan',
      kasus_posisi: 'Test kasus posisi'
    };

    const response = await request(baseURL)
      .post('/api/keberatan')
      .set('Authorization', `Bearer ${pemohonToken}`)
      .send(keberatanData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Keberatan berhasil dibuat');
    testKeberatanId = response.body.data.id;
  });

  test('GET /api/keberatan - Get all keberatan', async () => {
    const response = await request(baseURL)
      .get('/api/keberatan')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('GET /api/keberatan/:id - Get specific keberatan', async () => {
    const response = await request(baseURL)
      .get(`/api/keberatan/${testKeberatanId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(testKeberatanId);
  });

  test('PUT /api/keberatan/:id - Update keberatan status', async () => {
    const response = await request(baseURL)
      .put(`/api/keberatan/${testKeberatanId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Diproses' });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('Diproses');
  });

  test('DELETE /api/keberatan/:id - Delete keberatan', async () => {
    const response = await request(baseURL)
      .delete(`/api/keberatan/${testKeberatanId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  test('Unauthorized access should fail', async () => {
    const response = await request(baseURL)
      .get('/api/keberatan');

    expect(response.status).toBe(401);
  });
});