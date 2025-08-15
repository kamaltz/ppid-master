import request from 'supertest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

describe('All Endpoints Integration Test', () => {
  
  beforeAll(async () => {
    // Ensure database connection
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Server should be running', async () => {
    const response = await request(baseURL)
      .get('/api/debug-data');

    expect([200, 401, 404]).toContain(response.status);
  });

  test('Database connection should work', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    expect(result).toBeDefined();
  });

  test('All API endpoints should be accessible', async () => {
    const endpoints = [
      '/api/auth/login',
      '/api/auth/register', 
      '/api/informasi',
      '/api/permintaan',
      '/api/keberatan',
      '/api/accounts',
      '/api/pages',
      '/api/settings',
      '/api/kategori',
      '/api/profile',
      '/api/admin/stats',
      '/api/laporan',
      '/api/logs',
      '/api/upload'
    ];

    for (const endpoint of endpoints) {
      const response = await request(baseURL).get(endpoint);
      // Should not return 404 (endpoint exists)
      expect(response.status).not.toBe(404);
    }
  });
});