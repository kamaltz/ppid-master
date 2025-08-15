import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

let adminToken;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('testpass', 10);
  
  const admin = await prisma.admin.create({
    data: {
      email: 'test-settings-admin@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Admin Settings'
    }
  });
  
  adminToken = jwt.sign(
    { userId: admin.id, role: 'Admin', userType: 'admin' },
    process.env.JWT_SECRET
  );
});

afterAll(async () => {
  await prisma.admin.deleteMany({ where: { email: 'test-settings-admin@test.com' } });
  await prisma.$disconnect();
});

describe('Settings API Tests', () => {
  
  test('GET /api/settings - Get current settings', async () => {
    const response = await request(baseURL)
      .get('/api/settings');

    expect(response.status).toBe(200);
    expect(response.body.data).toBeDefined();
  });

  test('POST /api/settings - Update settings', async () => {
    const settingsData = {
      general: {
        namaInstansi: 'Test PPID Updated',
        logo: '/test-logo.png',
        alamat: 'Test Address Updated'
      },
      header: {
        showLogo: true,
        menuItems: [
          { label: 'Home', url: '/', hasDropdown: false }
        ]
      },
      footer: {
        showContact: true,
        companyName: 'Test Company',
        description: 'Test description'
      }
    };

    const response = await request(baseURL)
      .post('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(settingsData);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('berhasil');
  });

  test('GET /api/settings/debug - Get debug settings', async () => {
    const response = await request(baseURL)
      .get('/api/settings/debug')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
  });

  test('POST /api/settings - Reset to default settings', async () => {
    const defaultSettings = {
      general: {
        namaInstansi: 'PPID Diskominfo',
        logo: '/logo-garut.svg'
      },
      header: {
        showLogo: true
      },
      footer: {
        showContact: true
      }
    };

    const response = await request(baseURL)
      .post('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(defaultSettings);

    expect(response.status).toBe(200);
  });

  test('Unauthorized settings update should fail', async () => {
    const settingsData = {
      general: {
        namaInstansi: 'Unauthorized Update'
      }
    };

    const response = await request(baseURL)
      .post('/api/settings')
      .send(settingsData);

    expect(response.status).toBe(401);
  });

  test('Invalid settings data should fail', async () => {
    const invalidData = {
      invalid: 'data'
    };

    const response = await request(baseURL)
      .post('/api/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(invalidData);

    expect(response.status).toBe(400);
  });
});