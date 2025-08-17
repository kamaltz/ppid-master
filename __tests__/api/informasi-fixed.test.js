const jwt = require('jsonwebtoken');

// Mock prisma first
const mockPrisma = {
  informasiPublik: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

jest.mock('../../../../lib/lib/prismaClient', () => ({
  prisma: mockPrisma
}));

// Import after mock
const { NextRequest } = require('next/server');
const { GET, POST } = require('../../src/app/api/informasi/route.ts');

describe('Informasi API Tests (Fixed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /api/informasi', () => {
    test('should return public information', async () => {
      const mockData = [
        {
          id: 1,
          judul: 'Public Information',
          klasifikasi: 'Informasi Berkala',
          status: 'published',
          tanggal_posting: '2025-08-17T13:15:53.157Z'
        }
      ];

      mockPrisma.informasiPublik.findMany.mockResolvedValue(mockData);
      mockPrisma.informasiPublik.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/informasi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockData);
      expect(mockPrisma.informasiPublik.findMany).toHaveBeenCalledWith({
        where: { status: 'published' },
        orderBy: { tanggal_posting: 'desc' },
        skip: 0,
        take: 10
      });
    });

    test('should handle search functionality', async () => {
      mockPrisma.informasiPublik.findMany.mockResolvedValue([]);
      mockPrisma.informasiPublik.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/informasi?search=test&klasifikasi=berkala');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.informasiPublik.findMany).toHaveBeenCalledWith({
        where: {
          status: 'published',
          klasifikasi: 'berkala',
          OR: [
            { judul: { contains: 'test', mode: 'insensitive' } },
            { ringkasan_isi_informasi: { contains: 'test', mode: 'insensitive' } }
          ]
        },
        orderBy: { tanggal_posting: 'desc' },
        skip: 0,
        take: 10
      });
    });

    test('should handle server error', async () => {
      mockPrisma.informasiPublik.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/informasi');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server error');
    });
  });

  describe('POST /api/informasi', () => {
    test('should create information with valid token', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      const newInfo = {
        id: 1,
        judul: 'New Information',
        klasifikasi: 'Informasi Berkala',
        status: 'draft'
      };

      mockPrisma.informasiPublik.create.mockResolvedValue(newInfo);

      const request = new NextRequest('http://localhost:3000/api/informasi', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          judul: 'New Information',
          klasifikasi: 'Informasi Berkala',
          ringkasan_isi_informasi: 'Test content'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Informasi berhasil ditambahkan');
      expect(mockPrisma.informasiPublik.create).toHaveBeenCalled();
    });

    test('should reject access by pemohon', async () => {
      const token = jwt.sign({ role: 'Pemohon', id: '1' }, 'test-secret');

      const request = new NextRequest('http://localhost:3000/api/informasi', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          judul: 'Test',
          klasifikasi: 'Informasi Berkala'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });

    test('should validate required fields', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');

      const request = new NextRequest('http://localhost:3000/api/informasi', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          judul: '',
          klasifikasi: ''
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Judul dan klasifikasi wajib diisi');
    });

    test('should handle server error', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      mockPrisma.informasiPublik.create.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/informasi', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          judul: 'Test',
          klasifikasi: 'Informasi Berkala'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server error');
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/informasi', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          judul: 'Test',
          klasifikasi: 'Informasi Berkala'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });
});