const jwt = require('jsonwebtoken');

// Mock prisma client before importing route
const mockPrisma = {
  kategori: {
    findMany: jest.fn().mockResolvedValue([
      { id: 1, nama: "Informasi Berkala", deskripsi: "Test", created_at: new Date() }
    ]),
    create: jest.fn().mockResolvedValue({
      id: 2, nama: "New Category", deskripsi: "Test description", created_at: new Date()
    }),
    findFirst: jest.fn().mockResolvedValue(null),
    findUnique: jest.fn().mockResolvedValue(null)
  }
};

jest.mock('../../../../lib/lib/prismaClient', () => ({
  prisma: mockPrisma
}));

// Import after mock
const { NextRequest } = require('next/server');
const { GET, POST } = require('../../src/app/api/kategori/route.ts');

describe('Kategori API Tests (Fixed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /api/kategori', () => {
    test('should return all categories', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].nama).toBe('Informasi Berkala');
    });

    test('should handle empty categories', async () => {
      // Mock empty result
      mockPrisma.kategori.findMany.mockResolvedValueOnce([]);
      
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(0);
    });
  });

  describe('POST /api/kategori', () => {
    test('should create category by admin', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');

      const request = new NextRequest('http://localhost:3000/api/kategori', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          nama: 'New Category',
          deskripsi: 'Test description'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.nama).toBe('New Category');
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/kategori', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          nama: 'Test Category'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    test('should reject pemohon access', async () => {
      const token = jwt.sign({ role: 'Pemohon', id: '1' }, 'test-secret');

      const request = new NextRequest('http://localhost:3000/api/kategori', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          nama: 'Test Category'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    test('should reject duplicate names', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      
      // Mock finding existing category
      mockPrisma.kategori.findFirst.mockResolvedValueOnce({
        id: 1, nama: 'Informasi Berkala', created_at: new Date()
      });

      const request = new NextRequest('http://localhost:3000/api/kategori', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          nama: 'Informasi Berkala', // Duplicate name
          deskripsi: 'Test'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Nama kategori sudah digunakan');
    });
  });
});