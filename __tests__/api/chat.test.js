const { GET, POST } = require('../../src/app/api/chat/[requestId]/route');

// Mock Prisma
jest.mock('../../lib/lib/prismaClient', () => ({
  prisma: {
    requestResponse: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    chatSession: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

const { prisma } = require('../../lib/lib/prismaClient');
const jwt = require('jsonwebtoken');

describe('/api/chat/[requestId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterAll(() => {
    jest.restoreAllMocks();
    delete process.env.JWT_SECRET;
  });

  describe('GET', () => {
    it('should return chat messages', async () => {
      prisma.chatSession.findUnique.mockResolvedValue({ is_active: true });
      prisma.requestResponse.findMany.mockResolvedValue([
        { id: 1, message: 'Test message', user_name: 'Test User', created_at: new Date() }
      ]);

      const mockRequest = {};
      const response = await GET(mockRequest, { params: Promise.resolve({ requestId: '1' }) });
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.messages)).toBe(true);
    });
  });

  describe('POST', () => {
    it('should create chat message', async () => {
      jwt.verify.mockReturnValue({ id: '1', role: 'Pemohon', nama: 'Test User' });
      prisma.requestResponse.create.mockResolvedValue({ id: 1 });

      const mockRequest = {
        headers: {
          get: jest.fn((name) => {
            if (name === 'authorization') return 'Bearer valid-token';
            return null;
          })
        },
        json: jest.fn().mockResolvedValue({ message: 'Test message', attachments: [] })
      };

      const response = await POST(mockRequest, { params: Promise.resolve({ requestId: '1' }) });
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should require message', async () => {
      jwt.verify.mockReturnValue({ id: '1', role: 'Pemohon', nama: 'Test User' });
      
      const mockRequest = {
        headers: {
          get: jest.fn((name) => {
            if (name === 'authorization') return 'Bearer valid-token';
            return null;
          })
        },
        json: jest.fn().mockResolvedValue({ attachments: [] })
      };

      const response = await POST(mockRequest, { params: Promise.resolve({ requestId: '1' }) });
      const data = await response.json();
      expect(response.status).toBe(400);
    });
  });
});