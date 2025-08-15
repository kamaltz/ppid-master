import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

let adminToken;
let pemohonToken;
let testPemohonId;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('testpass', 10);
  
  const admin = await prisma.admin.create({
    data: {
      email: 'test-profile-admin@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Admin Profile'
    }
  });
  
  adminToken = jwt.sign(
    { userId: admin.id, role: 'Admin', userType: 'admin' },
    process.env.JWT_SECRET
  );

  const pemohon = await prisma.pemohon.create({
    data: {
      email: 'test-profile-pemohon@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Pemohon Profile',
      nik: '1234567890123456',
      no_telepon: '081234567890',
      alamat: 'Test Address Profile'
    }
  });
  
  testPemohonId = pemohon.id;
  pemohonToken = jwt.sign(
    { userId: pemohon.id, role: 'Pemohon', userType: 'pemohon' },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await prisma.admin.deleteMany({ where: { email: 'test-profile-admin@test.com' } });
  await prisma.pemohon.deleteMany({ where: { email: 'test-profile-pemohon@test.com' } });
  await prisma.$disconnect();
});

describe('Profile API Tests', () => {
  
  test('GET /api/profile - Get admin profile', async () => {
    const response = await request(baseURL)
      .get('/api/profile')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('test-profile-admin@test.com');
  });

  test('GET /api/profile - Get pemohon profile', async () => {
    const response = await request(baseURL)
      .get('/api/profile')
      .set('Authorization', `Bearer ${pemohonToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('test-profile-pemohon@test.com');
    expect(response.body.data.nik).toBe('1234567890123456');
  });

  test('PUT /api/profile - Update admin profile', async () => {
    const updateData = {
      nama: 'Updated Admin Profile Name'
    };

    const response = await request(baseURL)
      .put('/api/profile')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.nama).toBe('Updated Admin Profile Name');
  });

  test('PUT /api/profile - Update pemohon profile', async () => {
    const updateData = {
      nama: 'Updated Pemohon Profile Name',
      no_telepon: '081234567899',
      alamat: 'Updated Address'
    };

    const response = await request(baseURL)
      .put('/api/profile')
      .set('Authorization', `Bearer ${pemohonToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.nama).toBe('Updated Pemohon Profile Name');
    expect(response.body.data.no_telepon).toBe('081234567899');
  });

  test('PUT /api/profile - Change password', async () => {
    const updateData = {
      currentPassword: 'testpass',
      newPassword: 'newtestpass123'
    };

    const response = await request(baseURL)
      .put('/api/profile')
      .set('Authorization', `Bearer ${pemohonToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
  });

  test('PUT /api/profile - Invalid current password should fail', async () => {
    const updateData = {
      currentPassword: 'wrongpassword',
      newPassword: 'newtestpass123'
    };

    const response = await request(baseURL)
      .put('/api/profile')
      .set('Authorization', `Bearer ${pemohonToken}`)
      .send(updateData);

    expect(response.status).toBe(400);
  });

  test('Unauthorized profile access should fail', async () => {
    const response = await request(baseURL)
      .get('/api/profile');

    expect(response.status).toBe(401);
  });
});