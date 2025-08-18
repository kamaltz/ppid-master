const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const mockPrisma = {
  admin: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  pemohon: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  ppid: {
    findUnique: jest.fn(),
    update: jest.fn()
  }
};

jest.mock('../../../../lib/lib/prismaClient', () => ({
  prisma: mockPrisma
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

const { NextRequest } = require('next/server');
const { GET, PUT } = require('../../src/app/api/profile/route.ts');

describe('Profile API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /api/profile', () => {
    test('should return user profile', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      const mockUser = { id: 1, email: 'admin@test.com', nama: 'Admin User', created_at: new Date() };
      
      mockPrisma.admin.findUnique.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/profile', {
        headers: { 'authorization': `Bearer ${token}` }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe(mockUser.id);
      expect(data.data.email).toBe(mockUser.email);
      expect(data.data.nama).toBe(mockUser.nama);
      expect(data.data.role).toBe('ADMIN');
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/profile');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('PUT /api/profile', () => {
    test('should update profile', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      const updatedUser = { id: 1, email: 'admin@test.com', nama: 'Updated Name' };
      
      mockPrisma.admin.findUnique.mockResolvedValue({ id: 1, hashed_password: 'hashedpass' });
      mockPrisma.admin.update.mockResolvedValue(updatedUser);

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          nama: 'Updated Name',
          email: 'admin@test.com'
        })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test('should update password when provided', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      
      mockPrisma.admin.findUnique.mockResolvedValue({ id: 1, hashed_password: 'oldpass' });
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue('newhashedpass');
      mockPrisma.admin.update.mockResolvedValue({ id: 1, nama: 'Admin', email: 'admin@test.com' });

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          nama: 'Admin',
          email: 'admin@test.com',
          currentPassword: 'oldpass',
          newPassword: 'newpass123'
        })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpass123', 10);
    });

    test('should validate current password', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      
      mockPrisma.admin.findUnique.mockResolvedValue({ id: 1, hashed_password: 'hashedpass' });
      bcrypt.compare.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          nama: 'Admin',
          email: 'admin@test.com',
          currentPassword: 'wrongpass',
          newPassword: 'newpass123'
        })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Password saat ini salah');
    });
  });
});