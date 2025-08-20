const { createMocks } = require('node-mocks-http');
const { POST, GET } = require('../../src/app/api/admin/assign-ppid/route');

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    ppid: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    request: {
      update: jest.fn(),
    },
    keberatan: {
      update: jest.fn(),
    },
  },
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const { prisma } = require('../../src/lib/prisma');
const jwt = require('jsonwebtoken');

describe('/api/admin/assign-ppid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
    // Clean up rate limiter
    const { cleanupRateLimit } = require('../../src/lib/rateLimiter');
    cleanupRateLimit();
  });

  describe('GET', () => {
    it('should return PPID list with search', async () => {
      jwt.verify.mockReturnValue({ id: '1', role: 'ADMIN' });
      prisma.ppid.findMany.mockResolvedValue([
        { id: 1, nama: 'PPID Test', email: 'ppid@test.com', no_pegawai: '123', role: 'PPID_PELAKSANA' }
      ]);
      prisma.ppid.count.mockResolvedValue(1);

      const mockRequest = {
        headers: {
          get: jest.fn((name) => {
            if (name === 'authorization') return 'Bearer valid-token';
            if (name === 'x-forwarded-for') return '127.0.0.1';
            return null;
          })
        },
        url: 'http://localhost:3000/api/admin/assign-ppid?search=test&page=1&limit=10'
      };

      const response = await GET(mockRequest);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should require authentication', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn(() => null)
        },
        url: 'http://localhost:3000/api/admin/assign-ppid'
      };

      const response = await GET(mockRequest);
      const data = await response.json();
      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });
  });

  describe('POST', () => {
    it('should assign request to PPID', async () => {
      jwt.verify.mockReturnValue({ id: '1', role: 'ADMIN' });
      prisma.ppid.findUnique.mockResolvedValue({ id: 1, role: 'PPID_PELAKSANA' });
      prisma.request.update.mockResolvedValue({ id: 1 });

      const mockRequest = {
        headers: {
          get: jest.fn((name) => {
            if (name === 'authorization') return 'Bearer valid-token';
            return null;
          })
        },
        json: jest.fn().mockResolvedValue({ requestId: 1, ppidId: 1, type: 'request' })
      };

      const response = await POST(mockRequest);
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should require valid role', async () => {
      jwt.verify.mockReturnValue({ id: '1', role: 'PEMOHON' });

      const mockRequest = {
        headers: {
          get: jest.fn((name) => {
            if (name === 'authorization') return 'Bearer valid-token';
            return null;
          })
        },
        json: jest.fn().mockResolvedValue({ requestId: 1, ppidId: 1, type: 'request' })
      };

      const response = await POST(mockRequest);
      const data = await response.json();
      expect(response.status).toBe(403);
    });
  });
});