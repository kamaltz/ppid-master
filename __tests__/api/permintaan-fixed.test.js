const jwt = require('jsonwebtoken');

// Mock prisma first
const mockPrisma = {
  request: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  pemohon: {
    findMany: jest.fn()
  },
  activityLog: {
    create: jest.fn()
  }
};

jest.mock('../../../../lib/lib/prismaClient', () => ({
  prisma: mockPrisma
}));

// Mock daily limits
jest.mock('../../src/lib/dailyLimits', () => ({
  checkDailyRequestLimit: jest.fn().mockResolvedValue({ canSubmit: true, count: 0, limit: 10 }),
  checkDailyKeberatanLimit: jest.fn().mockResolvedValue({ canSubmit: true, count: 0, limit: 5 }),
  checkKeberatanForRequest: jest.fn().mockResolvedValue({ canSubmit: true })
}));

// Import after mock
const { NextRequest } = require('next/server');
const { GET, POST } = require('../../src/app/api/permintaan/route.ts');

describe('Permintaan API Tests (Fixed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /api/permintaan', () => {
    test('should return requests for pemohon', async () => {
      const token = jwt.sign({ role: 'Pemohon', userId: 1 }, 'test-secret');
      const mockRequests = [
        {
          id: 1,
          judul: 'Test Request',
          rincian_informasi: 'Test info',
          status: 'Diajukan',
          pemohon_id: 1,
          created_at: new Date(),
          updated_at: new Date(),
          pemohon: {
            id: 1,
            nama: 'Test User',
            email: 'test@example.com',
            nik: '123456',
            no_telepon: '08123456789'
          },
          assigned_ppid: null,
          _count: {
            responses: 0
          },
          responses: []
        }
      ];

      mockPrisma.request.findMany.mockResolvedValue(mockRequests);
      mockPrisma.request.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/permintaan', {
        headers: {
          'authorization': `Bearer ${token}`
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].pemohon.nama).toBe('Test User');
      expect(mockPrisma.request.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          pemohon: {
            select: { id: true, nama: true, email: true, nik: true, no_telepon: true }
          },
          assigned_ppid: {
            select: { id: true, nama: true, role: true }
          },
          _count: {
            select: { responses: true }
          },
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              message: true,
              created_at: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: 0,
        take: 50
      });
    });

    test('should handle pagination', async () => {
      const token = jwt.sign({ role: 'ADMIN', userId: 1 }, 'test-secret');
      
      mockPrisma.request.findMany.mockResolvedValue([]);
      mockPrisma.request.count.mockResolvedValue(25);
      mockPrisma.pemohon.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/permintaan?page=2&limit=10', {
        headers: {
          'authorization': `Bearer ${token}`
        }
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3
      });
      expect(mockPrisma.request.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          pemohon: {
            select: { id: true, nama: true, email: true, nik: true, no_telepon: true }
          },
          assigned_ppid: {
            select: { id: true, nama: true, role: true }
          },
          _count: {
            select: { responses: true }
          },
          responses: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              message: true,
              created_at: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: 10,
        take: 10
      });
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/permintaan');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    test('should handle server error', async () => {
      const token = jwt.sign({ role: 'PEMOHON', id: '1' }, 'test-secret');
      mockPrisma.request.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/permintaan', {
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

  describe('POST /api/permintaan', () => {
    test('should create request with valid data', async () => {
      const token = jwt.sign({ role: 'PEMOHON', id: '1' }, 'test-secret');
      const newRequest = {
        id: 1,
        judul: 'New Request',
        rincian_informasi: 'Test information',
        tujuan_penggunaan: 'Test purpose',
        status: 'Diajukan'
      };

      mockPrisma.request.create.mockResolvedValue(newRequest);
      mockPrisma.activityLog.create.mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/permintaan', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          judul: 'New Request',
          rincian_informasi: 'Test information',
          tujuan_penggunaan: 'Test purpose'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Permintaan berhasil dibuat');
      expect(mockPrisma.request.create).toHaveBeenCalled();
    });

    test('should validate required fields', async () => {
      const token = jwt.sign({ role: 'PEMOHON', userId: 1 }, 'test-secret');

      const request = new NextRequest('http://localhost:3000/api/permintaan', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          judul: ''
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Input mengandung karakter tidak valid atau terlalu panjang');
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/permintaan', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          rincian_informasi: 'Test info',
          tujuan_penggunaan: 'Test purpose'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    test('should handle server error', async () => {
      const token = jwt.sign({ role: 'PEMOHON', id: '1' }, 'test-secret');
      mockPrisma.request.create.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/permintaan', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          judul: 'Test',
          rincian_informasi: 'Test info',
          tujuan_penggunaan: 'Test purpose'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server error');
    });
  });
});