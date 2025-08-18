const jwt = require('jsonwebtoken');

const mockPrisma = {
  request: {
    findMany: jest.fn(),
    count: jest.fn()
  },
  keberatan: {
    findMany: jest.fn(),
    count: jest.fn()
  },
  informasiPublik: {
    findMany: jest.fn(),
    count: jest.fn()
  }
};

jest.mock('../../../../lib/lib/prismaClient', () => ({
  prisma: mockPrisma
}));

const { NextRequest } = require('next/server');
const { POST } = require('../../src/app/api/laporan/route.ts');

describe('Laporan API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /api/laporan', () => {
    test('should generate report for admin', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      
      mockPrisma.request.findMany.mockResolvedValue([
        { id: 1, judul: 'Test Request', status: 'Diajukan', created_at: new Date() }
      ]);
      mockPrisma.request.count.mockResolvedValue(1);
      mockPrisma.keberatan.findMany.mockResolvedValue([]);
      mockPrisma.keberatan.count.mockResolvedValue(0);
      mockPrisma.informasiPublik.findMany.mockResolvedValue([]);
      mockPrisma.informasiPublik.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/laporan', {
        method: 'POST',
        headers: { 
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ template: 'permohonan-bulanan' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    test('should filter by date range', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      
      mockPrisma.request.findMany.mockResolvedValue([]);
      mockPrisma.request.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/laporan', {
        method: 'POST',
        headers: { 
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ 
          template: 'permohonan-bulanan',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.request.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            created_at: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date)
            })
          })
        })
      );
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/laporan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ template: 'permohonan-bulanan' })
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    test('should require admin role', async () => {
      const token = jwt.sign({ role: 'PEMOHON', id: '1' }, 'test-secret');

      const request = new NextRequest('http://localhost:3000/api/laporan', {
        method: 'POST',
        headers: { 
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ template: 'permohonan-bulanan' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Access denied');
    });
  });
});