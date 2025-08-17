const jwt = require('jsonwebtoken');

// Mock prisma first
const mockPrisma = {
  keberatan: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  permintaan: {
    create: jest.fn(),
    findFirst: jest.fn()
  }
};

jest.mock('../../../../lib/lib/prismaClient', () => ({
  prisma: mockPrisma
}));

// Import after mock
const { NextRequest } = require('next/server');
const { GET, POST } = require('../../src/app/api/keberatan/route.ts');

describe('Keberatan API Tests (Fixed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /api/keberatan', () => {
    test('should return keberatan for pemohon', async () => {
      const token = jwt.sign({ role: 'Pemohon', id: '1' }, 'test-secret');
      const mockData = [
        {
          id: 1,
          judul: 'Test Keberatan',
          alasan_keberatan: 'Test reason',
          status: 'Diajukan',
          permintaan: { id: 1, rincian_informasi: 'Test info' },
          pemohon: { nama: 'Test User', email: 'test@example.com' }
        }
      ];

      mockPrisma.keberatan.findMany.mockResolvedValue(mockData);

      const request = new NextRequest('http://localhost:3000/api/keberatan', {
        headers: {
          'authorization': `Bearer ${token}`
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
      expect(mockPrisma.keberatan.findMany).toHaveBeenCalledWith({
        where: { pemohon_id: 1 },
        include: expect.any(Object),
        orderBy: { created_at: 'desc' }
      });
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/keberatan');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    test('should handle server error', async () => {
      const token = jwt.sign({ role: 'Pemohon', id: '1' }, 'test-secret');
      mockPrisma.keberatan.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/keberatan', {
        headers: {
          'authorization': `Bearer ${token}`
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server error');
    });
  });

  describe('POST /api/keberatan', () => {
    test('should create keberatan by pemohon', async () => {
      const token = jwt.sign({ role: 'Pemohon', id: '1' }, 'test-secret');
      const newKeberatan = {
        id: 1,
        judul: 'New Keberatan',
        alasan_keberatan: 'Test reason',
        status: 'Diajukan'
      };

      mockPrisma.permintaan.create.mockResolvedValue({ id: 1 });
      mockPrisma.keberatan.create.mockResolvedValue(newKeberatan);

      const request = new NextRequest('http://localhost:3000/api/keberatan', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          judul: 'New Keberatan',
          alasan_keberatan: 'Test reason'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Keberatan berhasil dibuat');
      expect(mockPrisma.keberatan.create).toHaveBeenCalled();
    });

    test('should reject non-pemohon users', async () => {
      const token = jwt.sign({ role: 'Admin', userId: 1 }, 'test-secret');

      const request = new NextRequest('http://localhost:3000/api/keberatan', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          alasan_keberatan: 'Test reason'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Only pemohon can create keberatan');
    });

    test('should validate required fields', async () => {
      const token = jwt.sign({ role: 'Pemohon', id: '1' }, 'test-secret');

      const request = new NextRequest('http://localhost:3000/api/keberatan', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          judul: 'Test'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Alasan keberatan wajib diisi');
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/keberatan', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          alasan_keberatan: 'Test reason'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });
});