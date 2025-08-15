import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

beforeAll(async () => {
  // Clean up test data
  await prisma.pemohon.deleteMany({ where: { email: { contains: 'test-auth' } } });
  await prisma.admin.deleteMany({ where: { email: { contains: 'test-auth' } } });
});

// Removed beforeEach cleanup to allow tests to run in sequence

afterAll(async () => {
  // Clean up test data
  await prisma.pemohon.deleteMany({ where: { email: { contains: 'test-auth' } } });
  await prisma.admin.deleteMany({ where: { email: { contains: 'test-auth' } } });
  await prisma.$disconnect();
});

describe('Authentication API Tests', () => {
  
  test('POST /api/auth/register - Register new pemohon', async () => {
    const userData = {
      email: 'test-auth-pemohon@test.com',
      password: 'testpass123',
      nama: 'Test Pemohon Auth',
      nik: '1234567890123456',
      no_telepon: '081234567890',
      alamat: 'Test Address Auth'
    };

    const response = await request(baseURL)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.message).toContain('berhasil');
  });

  test('POST /api/auth/register - Duplicate email should fail', async () => {
    const userData = {
      email: 'test-auth-pemohon@test.com',
      password: 'testpass123',
      nama: 'Test Duplicate',
      nik: '1234567890123457',
      no_telepon: '081234567891',
      alamat: 'Test Address'
    };

    const response = await request(baseURL)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(400);
  });

  test('POST /api/auth/login - Valid login', async () => {
    const loginData = {
      email: 'test-auth-pemohon@test.com',
      password: 'testpass123'
    };

    const response = await request(baseURL)
      .post('/api/auth/login')
      .send(loginData);

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test('POST /api/auth/login - Invalid credentials', async () => {
    const loginData = {
      email: 'test-auth-pemohon@test.com',
      password: 'wrongpassword'
    };

    const response = await request(baseURL)
      .post('/api/auth/login')
      .send(loginData);

    expect(response.status).toBe(401);
  });

  test('POST /api/auth/register - Invalid data should fail', async () => {
    const userData = {
      email: 'invalid-email',
      password: '123'
    };

    const response = await request(baseURL)
      .post('/api/auth/register')
      .send(userData);

    expect(response.status).toBe(400);
  });
});