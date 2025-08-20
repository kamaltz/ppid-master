const { GET } = require('../../src/app/api/health/route');

// Mock Prisma
jest.mock('../../src/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

const { prisma } = require('../../src/lib/prisma');

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should return healthy status', async () => {
    prisma.$queryRaw.mockResolvedValue([{ now: new Date() }]);

    const mockRequest = {};
    const response = await GET(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.database).toBe('connected');
  });

  it('should handle database error', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('DB Error'));

    const mockRequest = {};
    const response = await GET(mockRequest);
    const data = await response.json();
    expect(response.status).toBe(503);
    expect(data.status).toBe('unhealthy');
    expect(data.database).toBe('disconnected');
  });
});