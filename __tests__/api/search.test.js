import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

let adminToken;
let testInformasiId;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('testpass', 10);
  
  // Clean up first
  await prisma.admin.deleteMany({ where: { email: 'test-search-admin@test.com' } });
  
  const admin = await prisma.admin.create({
    data: {
      email: 'test-search-admin@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Admin Search'
    }
  });
  
  adminToken = jwt.sign(
    { userId: admin.id, role: 'Admin', userType: 'admin' },
    process.env.JWT_SECRET
  );

  // Create test informasi for search
  const informasi = await prisma.informasiPublik.create({
    data: {
      judul: 'Test Searchable Information',
      klasifikasi: 'Publik',
      ringkasan_isi_informasi: 'This is a test information for search functionality',
      pejabat_penguasa_informasi: 'Test Official'
    }
  });
  
  testInformasiId = informasi.id;
});

afterAll(async () => {
  await prisma.informasiPublik.deleteMany({ where: { id: testInformasiId } });
  await prisma.admin.deleteMany({ where: { email: 'test-search-admin@test.com' } });
  await prisma.$disconnect();
});

describe('Search API Tests', () => {
  
  test('GET /api/informasi?search=searchable - Search informasi by keyword', async () => {
    const response = await request(baseURL)
      .get('/api/informasi?search=searchable');

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('GET /api/informasi?search=nonexistent - Search with no results', async () => {
    const response = await request(baseURL)
      .get('/api/informasi?search=nonexistentterm12345');

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBe(0);
  });

  test('GET /api/informasi?kategori=test - Filter by category', async () => {
    const response = await request(baseURL)
      .get('/api/informasi?kategori=test');

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('GET /api/informasi?page=1&limit=5 - Pagination', async () => {
    const response = await request(baseURL)
      .get('/api/informasi?page=1&limit=5');

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.data.length).toBeLessThanOrEqual(5);
  });

  test('GET /api/informasi?search=test&kategori=digital - Combined search and filter', async () => {
    const response = await request(baseURL)
      .get('/api/informasi?search=test&kategori=digital');

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('GET /api/permintaan?search=test - Search permintaan (admin only)', async () => {
    const response = await request(baseURL)
      .get('/api/permintaan?search=test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('GET /api/keberatan?search=test - Search keberatan (admin only)', async () => {
    const response = await request(baseURL)
      .get('/api/keberatan?search=test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('Search with empty query should return all results', async () => {
    const response = await request(baseURL)
      .get('/api/informasi?search=');

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });
});