import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

let adminToken;
let testUserId;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('testpass', 10);
  
  const admin = await prisma.admin.create({
    data: {
      email: 'test-admin-main@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Admin Main'
    }
  });
  
  adminToken = jwt.sign(
    { userId: admin.id, role: 'Admin', userType: 'admin' },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await prisma.admin.deleteMany({ where: { email: { contains: 'test-admin' } } });
  await prisma.pemohon.deleteMany({ where: { email: { contains: 'test-admin' } } });
  await prisma.$disconnect();
});

describe('Admin API Tests', () => {
  
  test('GET /api/admin/stats - Get admin statistics', async () => {
    const response = await request(baseURL)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.totalPermintaan).toBeDefined();
    expect(response.body.data.totalInformasi).toBeDefined();
  });

  test('GET /api/admin/users - Get all users', async () => {
    const response = await request(baseURL)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('POST /api/admin/users - Create new user', async () => {
    const userData = {
      email: 'test-admin-newuser@test.com',
      password: 'testpass123',
      nama: 'Test New User',
      role: 'Admin'
    };

    const response = await request(baseURL)
      .post('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe(userData.email);
    testUserId = response.body.data.id;
  });

  test('GET /api/admin/users/:id - Get specific user', async () => {
    const response = await request(baseURL)
      .get(`/api/admin/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(testUserId);
  });

  test('PUT /api/admin/users/:id - Update user', async () => {
    const updateData = {
      nama: 'Updated User Name'
    };

    const response = await request(baseURL)
      .put(`/api/admin/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.nama).toBe('Updated User Name');
  });

  test('DELETE /api/admin/users/:id - Delete user', async () => {
    const response = await request(baseURL)
      .delete(`/api/admin/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  test('GET /api/laporan - Get reports', async () => {
    const response = await request(baseURL)
      .get('/api/laporan')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });

  test('GET /api/logs - Get system logs', async () => {
    const response = await request(baseURL)
      .get('/api/logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('Unauthorized admin access should fail', async () => {
    const response = await request(baseURL)
      .get('/api/admin/stats');

    expect(response.status).toBe(401);
  });
});