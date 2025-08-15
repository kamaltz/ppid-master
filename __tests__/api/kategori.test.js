import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

let adminToken;
let testKategoriId;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('testpass', 10);
  
  // Clean up first
  await prisma.admin.deleteMany({ where: { email: 'test-kategori-admin@test.com' } });
  
  const admin = await prisma.admin.create({
    data: {
      email: 'test-kategori-admin@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Admin Kategori'
    }
  });
  
  adminToken = jwt.sign(
    { userId: admin.id, role: 'Admin', userType: 'admin' },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await prisma.kategoriInformasi.deleteMany({ where: { nama: { contains: 'Test Kategori' } } });
  await prisma.admin.deleteMany({ where: { email: 'test-kategori-admin@test.com' } });
  await prisma.$disconnect();
});

describe('Kategori API Tests', () => {
  
  test('GET /api/kategori - Get all categories', async () => {
    const response = await request(baseURL)
      .get('/api/kategori');

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('POST /api/kategori - Create new category', async () => {
    const kategoriData = {
      nama: 'Test Kategori New',
      deskripsi: 'Test kategori description'
    };

    const response = await request(baseURL)
      .post('/api/kategori')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(kategoriData);

    expect(response.status).toBe(201);
    expect(response.body.data.nama).toBe('Test Kategori New');
    testKategoriId = response.body.data.id;
  });

  test('GET /api/kategori/:id - Get specific category', async () => {
    const response = await request(baseURL)
      .get(`/api/kategori/${testKategoriId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(testKategoriId);
  });

  test('PUT /api/kategori/:id - Update category', async () => {
    const updateData = {
      nama: 'Test Kategori Updated',
      deskripsi: 'Updated description'
    };

    const response = await request(baseURL)
      .put(`/api/kategori/${testKategoriId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.nama).toBe('Test Kategori Updated');
  });

  test('DELETE /api/kategori/:id - Delete category', async () => {
    const response = await request(baseURL)
      .delete(`/api/kategori/${testKategoriId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  test('POST /api/kategori - Duplicate category name should fail', async () => {
    // Create first category
    await request(baseURL)
      .post('/api/kategori')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama: 'Test Duplicate', deskripsi: 'Test' });

    // Try to create duplicate
    const response = await request(baseURL)
      .post('/api/kategori')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nama: 'Test Duplicate', deskripsi: 'Test duplicate' });

    expect(response.status).toBe(400);
  });

  test('Unauthorized category creation should fail', async () => {
    const kategoriData = {
      nama: 'Unauthorized Category',
      deskripsi: 'Test description'
    };

    const response = await request(baseURL)
      .post('/api/kategori')
      .send(kategoriData);

    expect(response.status).toBe(401);
  });
});