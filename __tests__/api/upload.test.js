import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const baseURL = 'http://localhost:3000';

let adminToken;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('testpass', 10);
  
  const admin = await prisma.admin.create({
    data: {
      email: 'test-upload-admin@test.com',
      hashed_password: hashedPassword,
      nama: 'Test Admin Upload'
    }
  });
  
  adminToken = jwt.sign(
    { userId: admin.id, role: 'Admin', userType: 'admin' },
    process.env.JWT_SECRET
  );

  // Create test image file
  const testImagePath = path.join(process.cwd(), 'test-image.png');
  if (!fs.existsSync(testImagePath)) {
    // Create a minimal PNG file for testing
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
      0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, pngBuffer);
  }
});

afterAll(async () => {
  await prisma.admin.deleteMany({ where: { email: 'test-upload-admin@test.com' } });
  await prisma.$disconnect();
  
  // Clean up test files
  const testImagePath = path.join(process.cwd(), 'test-image.png');
  if (fs.existsSync(testImagePath)) {
    fs.unlinkSync(testImagePath);
  }
});

describe('Upload API Tests', () => {
  
  test('POST /api/upload/image - Upload image file', async () => {
    const testImagePath = path.join(process.cwd(), 'test-image.png');
    
    const response = await request(baseURL)
      .post('/api/upload/image')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', testImagePath);

    expect(response.status).toBe(200);
    expect(response.body.url).toBeDefined();
    expect(response.body.url).toContain('/uploads/');
  });

  test('POST /api/upload - Upload general file', async () => {
    const testImagePath = path.join(process.cwd(), 'test-image.png');
    
    const response = await request(baseURL)
      .post('/api/upload')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', testImagePath);

    expect(response.status).toBe(200);
    expect(response.body.url).toBeDefined();
  });

  test('POST /api/upload/image - Upload without file should fail', async () => {
    const response = await request(baseURL)
      .post('/api/upload/image')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  test('POST /api/upload/image - Unauthorized upload should fail', async () => {
    const testImagePath = path.join(process.cwd(), 'test-image.png');
    
    const response = await request(baseURL)
      .post('/api/upload/image')
      .attach('file', testImagePath);

    expect(response.status).toBe(401);
  });

  test('POST /api/upload/image - Invalid file type should fail', async () => {
    // Create a text file to test invalid file type
    const testTextPath = path.join(process.cwd(), 'test-file.txt');
    fs.writeFileSync(testTextPath, 'This is a test text file');
    
    const response = await request(baseURL)
      .post('/api/upload/image')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', testTextPath);

    // Clean up
    fs.unlinkSync(testTextPath);
    
    expect(response.status).toBe(400);
  });
});