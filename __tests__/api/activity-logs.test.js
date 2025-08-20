const { GET } = require('../../src/app/api/admin/activity-logs/route');

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    activityLog: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const { prisma } = require('../../src/lib/prisma');
const jwt = require('jsonwebtoken');

describe('/api/admin/activity-logs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return activity logs for admin', async () => {
    jwt.verify.mockReturnValue({ id: '1', role: 'ADMIN' });
    prisma.activityLog.findMany.mockResolvedValue([
      { id: 1, action: 'LOGIN', user_role: 'ADMIN', created_at: new Date() }
    ]);
    prisma.activityLog.count.mockResolvedValue(1);

    const mockRequest = {
      headers: {
        get: jest.fn((name) => {
          if (name === 'authorization') return 'Bearer valid-token';
          return null;
        })
      },
      url: 'http://localhost:3000/api/admin/activity-logs'
    };

    const response = await GET(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  it('should require admin role', async () => {
    jwt.verify.mockReturnValue({ id: '1', role: 'PEMOHON' });

    const mockRequest = {
      headers: {
        get: jest.fn((name) => {
          if (name === 'authorization') return 'Bearer valid-token';
          return null;
        })
      }
    };

    const response = await GET(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(403);
  });

  it('should require authentication', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn(() => null)
      }
    };

    const response = await GET(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(401);
  });
});