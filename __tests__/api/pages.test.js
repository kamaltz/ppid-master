const jwt = require('jsonwebtoken');

const mockPrisma = {
  page: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
};

jest.mock('../../../../lib/lib/prismaClient', () => ({
  prisma: mockPrisma
}));

const { NextRequest } = require('next/server');
const { GET, POST } = require('../../src/app/api/pages/route.ts');

describe('Pages API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('GET /api/pages', () => {
    test('should return all pages', async () => {
      const mockPages = [
        { id: 1, title: 'About', slug: 'about', content: 'About content', status: 'published' }
      ];
      
      mockPrisma.page.findMany.mockResolvedValue(mockPages);

      const request = new NextRequest('http://localhost:3000/api/pages');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPages);
    });

    test('should filter by status', async () => {
      mockPrisma.page.findMany.mockResolvedValue([]);

      const request = new NextRequest('http://localhost:3000/api/pages?status=published');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.page.findMany).toHaveBeenCalledWith({
        where: { status: 'published' },
        orderBy: { created_at: 'desc' }
      });
    });
  });

  describe('POST /api/pages', () => {
    test('should create page with admin token', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');
      
      mockPrisma.page.findUnique.mockResolvedValue(null);
      mockPrisma.page.create.mockResolvedValue({
        id: 1, title: 'New Page', slug: 'new-page', content: 'Content'
      });

      const request = new NextRequest('http://localhost:3000/api/pages', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          title: 'New Page',
          slug: 'new-page',
          content: 'Content'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/pages', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: 'Test', slug: 'test' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    test('should validate required fields', async () => {
      const token = jwt.sign({ role: 'ADMIN', id: '1' }, 'test-secret');

      const request = new NextRequest('http://localhost:3000/api/pages', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ title: '', slug: '' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Judul dan slug harus diisi');
    });
  });
});