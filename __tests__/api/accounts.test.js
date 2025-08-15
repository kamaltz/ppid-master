import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

let adminToken;
let testAccountId;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('testpass', 10);
  
  const admin = await prisma.admin.create({
    data: {
      email: 'test-accounts-admin@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Admin Accounts'
    }
  });
  
  adminToken = jwt.sign(
    { userId: admin.id, role: 'Admin', userType: 'admin' },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await prisma.admin.deleteMany({ where: { email: { contains: 'test-accounts' } } });
  await prisma.pemohon.deleteMany({ where: { email: { contains: 'test-accounts' } } });
  await prisma.$disconnect();
});

describe('Accounts Management API Tests', () => {
  
  test('GET /api/accounts - Get all accounts', async () => {
    const response = await request(baseURL)
      .get('/api/accounts')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('POST /api/accounts - Create new account', async () => {
    const accountData = {
      email: 'test-accounts-new@test.com',
      password: 'testpass123',
      nama: 'Test New Account',
      role: 'Pemohon',
      nik: '1234567890123456',
      no_telepon: '081234567890',
      alamat: 'Test Address'
    };

    const response = await request(baseURL)
      .post('/api/accounts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(accountData);

    expect(response.status).toBe(201);
    testAccountId = response.body.data.id;
  });

  test('GET /api/accounts/:id - Get specific account', async () => {
    const response = await request(baseURL)
      .get(`/api/accounts/${testAccountId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(testAccountId);
  });

  test('PUT /api/accounts/:id - Update account', async () => {
    const updateData = {
      nama: 'Updated Account Name'
    };

    const response = await request(baseURL)
      .put(`/api/accounts/${testAccountId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.nama).toBe('Updated Account Name');
  });

  test('DELETE /api/accounts/:id - Delete account', async () => {
    const response = await request(baseURL)
      .delete(`/api/accounts/${testAccountId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  test('Unauthorized access should fail', async () => {
    const response = await request(baseURL)
      .get('/api/accounts');

    expect(response.status).toBe(401);
  });
});