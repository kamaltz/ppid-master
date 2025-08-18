const jwt = require('jsonwebtoken');

const mockPrisma = {
  admin: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  pemohon: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  ppid: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

jest.mock('../../../../lib/lib/prismaClient', () => ({
  prisma: mockPrisma
}));

const { NextRequest } = require('next/server');
const { GET, POST } = require('../../src/app/api/accounts/route.ts');

describe('Accounts API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /api/accounts', () => {
    test('should return all accounts for admin', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      
      mockPrisma.admin.findMany.mockResolvedValue([{ 
        id: 1, 
        nama: 'Admin User',
        email: 'admin@test.com', 
        created_at: new Date('2025-01-01')
      }]);
      mockPrisma.pemohon.findMany.mockResolvedValue([{ 
        id: 1, 
        nama: 'Pemohon User',
        email: 'user@test.com', 
        nik: '123456789',
        created_at: new Date('2025-01-01')
      }]);
      mockPrisma.ppid.findMany.mockResolvedValue([{ 
        id: 1, 
        nama: 'PPID User',
        email: 'ppid@test.com', 
        role: 'PPID_UTAMA',
        created_at: new Date('2025-01-01')
      }]);

      const request = new NextRequest('http://localhost:3000/api/accounts', {
        headers: { 'authorization': `Bearer ${token}` }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/accounts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('POST /api/accounts', () => {
    test('should create admin account', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      
      mockPrisma.admin.findUnique.mockResolvedValue(null);
      mockPrisma.admin.create.mockResolvedValue({ id: 2, email: 'new@admin.com', role: 'ADMIN' });

      const request = new NextRequest('http://localhost:3000/api/accounts', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          email: 'new@admin.com',
          password: 'password123',
          nama: 'New Admin',
          role: 'ADMIN'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    test('should validate required fields', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');

      const request = new NextRequest('http://localhost:3000/api/accounts', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          email: '',
          password: '',
          nama: ''
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Nama, email, dan role wajib diisi');
    });
  });
});