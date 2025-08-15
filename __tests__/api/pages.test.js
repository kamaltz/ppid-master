import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

let adminToken;
let testPageId;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('testpass', 10);
  
  const admin = await prisma.admin.create({
    data: {
      email: 'test-pages-admin@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Admin Pages'
    }
  });
  
  adminToken = jwt.sign(
    { userId: admin.id, role: 'Admin', userType: 'admin' },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await prisma.page.deleteMany({ where: { title: { contains: 'Test Page' } } });
  await prisma.admin.deleteMany({ where: { email: 'test-pages-admin@test.com' } });
  await prisma.$disconnect();
});

describe('Pages Management API Tests', () => {
  
  test('GET /api/pages - Get all pages', async () => {
    const response = await request(baseURL)
      .get('/api/pages');

    expect(response.status).toBe(200);
    expect(response.body.data).toBeInstanceOf(Array);
  });

  test('POST /api/pages - Create new page', async () => {
    const pageData = {
      title: 'Test Page Title',
      slug: 'test-page-slug',
      content: 'Test page content',
      status: 'published'
    };

    const response = await request(baseURL)
      .post('/api/pages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(pageData);

    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Test Page Title');
    testPageId = response.body.data.id;
  });

  test('GET /api/pages/:id - Get specific page', async () => {
    const response = await request(baseURL)
      .get(`/api/pages/${testPageId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(testPageId);
  });

  test('PUT /api/pages/:id - Update page', async () => {
    const updateData = {
      title: 'Updated Test Page Title',
      content: 'Updated test page content'
    };

    const response = await request(baseURL)
      .put(`/api/pages/${testPageId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Updated Test Page Title');
  });

  test('DELETE /api/pages/:id - Delete page', async () => {
    const response = await request(baseURL)
      .delete(`/api/pages/${testPageId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  test('Unauthorized create should fail', async () => {
    const pageData = {
      title: 'Unauthorized Page',
      slug: 'unauthorized-page',
      content: 'Test content'
    };

    const response = await request(baseURL)
      .post('/api/pages')
      .send(pageData);

    expect(response.status).toBe(401);
  });
});