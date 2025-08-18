const mockPrisma = {
  request: {
    count: jest.fn()
  },
  keberatan: {
    count: jest.fn()
  },
  informasiPublik: {
    count: jest.fn()
  }
};

jest.mock('../../../../lib/lib/prismaClient', () => ({
  prisma: mockPrisma
}));

const { NextRequest } = require('next/server');
const { GET } = require('../../src/app/api/stats/public/route.ts');

describe('Public Stats API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/stats/public', () => {
    test('should return public statistics', async () => {
      mockPrisma.request.count.mockResolvedValue(25);
      mockPrisma.keberatan.count.mockResolvedValue(3);
      mockPrisma.informasiPublik.count.mockResolvedValue(15);

      const request = new NextRequest('http://localhost:3000/api/stats/public');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        totalPermintaan: 25,
        permintaanSelesai: 18,
        rataRataHari: 5,
        totalInformasi: 42
      });
    });

    test('should handle server error', async () => {
      mockPrisma.request.count.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/stats/public');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    test('should not require authentication', async () => {
      mockPrisma.request.count.mockResolvedValue(0);
      mockPrisma.keberatan.count.mockResolvedValue(0);
      mockPrisma.informasiPublik.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/stats/public');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });
});