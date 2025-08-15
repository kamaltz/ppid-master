import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

let adminToken;
let pemohonToken;
let testPemohonId;
let testRequestId;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('testpass', 10);
  
  const admin = await prisma.admin.create({
    data: {
      email: 'test-admin@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Admin'
    }
  });
  
  adminToken = jwt.sign(
    { userId: admin.id, role: 'Admin', userType: 'admin' },
    process.env.JWT_SECRET
  );
  
  const pemohon = await prisma.pemohon.create({
    data: {
      email: 'test-pemohon@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Pemohon',
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
  await prisma.request.deleteMany({ where: { pemohon_id: testPemohonId } });
  await prisma.admin.deleteMany({ where: { email: 'test-admin@test.com' } });
  await prisma.pemohon.deleteMany({ where: { email: 'test-pemohon@test.com' } });
  await prisma.$disconnect();
});

describe('Permintaan API Tests', () => {
  
  test('POST /api/permintaan - Submit new request', async () => {
    const requestData = {
      rincian_informasi: 'Test information request',
      tujuan_penggunaan: 'Test purpose',
      cara_memperoleh_informasi: 'Email',
      cara_mendapat_salinan: 'Email'
    };

    const response = await request(baseURL)
      .post('/api/permintaan')
      .set('Authorization', `Bearer ${pemohonToken}`)
      .send(requestData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Permintaan berhasil dibuat');
    testRequestId = response.body.data.id;
  });

  test('GET /api/permintaan - Get all requests', async () => {
    const response = await request(baseURL)
      .get('/api/permintaan')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('PUT /api/permintaan/:id - Update status to Diproses', async () => {
    const response = await request(baseURL)
      .put(`/api/permintaan/${testRequestId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Diproses' });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('Diproses');
  });

  test('PUT /api/permintaan/:id - Update status to Selesai', async () => {
    const response = await request(baseURL)
      .put(`/api/permintaan/${testRequestId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Selesai' });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('Selesai');
  });



  test('DELETE /api/permintaan/:id - Delete request', async () => {
    // Create new request for deletion
    const newRequest = await request(baseURL)
      .post('/api/permintaan')
      .set('Authorization', `Bearer ${pemohonToken}`)
      .send({
        rincian_informasi: 'Delete test',
        tujuan_penggunaan: 'Test delete',
        cara_memperoleh_informasi: 'Email',
        cara_mendapat_salinan: 'Email'
      });

    const deleteResponse = await request(baseURL)
      .delete(`/api/permintaan/${newRequest.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteResponse.status).toBe(200);
  });

  test('Unauthorized access should fail', async () => {
    const response = await request(baseURL)
      .get('/api/permintaan');

    expect(response.status).toBe(401);
  });

  test('Invalid request data should fail', async () => {
    const response = await request(baseURL)
      .post('/api/permintaan')
      .set('Authorization', `Bearer ${pemohonToken}`)
      .send({ invalid: 'data' });

    expect(response.status).toBe(400);
  });

});