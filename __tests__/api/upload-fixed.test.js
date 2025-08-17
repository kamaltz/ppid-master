const jwt = require('jsonwebtoken');

// Mock prisma first
const mockPrisma = {};

jest.mock('../../lib/lib/prismaClient', () => ({
  prisma: mockPrisma
}));

// Mock fs/promises
jest.mock('fs/promises', () => ({
  writeFile: jest.fn()
}));

// Import after mock
const { NextRequest } = require('next/server');
const { POST } = require('../../src/app/api/upload/route.ts');

describe('Upload API Tests (Fixed)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('POST /api/upload', () => {
    test('should upload file with admin token', async () => {
      const token = jwt.sign({ role: 'ADMIN' }, 'test-secret');
      const mockFile = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
      };

      // Mock formData method
      const mockFormData = {
        get: jest.fn().mockReturnValue(mockFile)
      };

      const request = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'authorization') return `Bearer ${token}`;
            return null;
          })
        },
        formData: jest.fn().mockResolvedValue(mockFormData)
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.filename).toBeDefined();
      expect(data.originalName).toBe('test.pdf');
    });

    test('should require authentication', async () => {
      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: new FormData()
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    test('should reject pemohon access', async () => {
      const token = jwt.sign({ role: 'Pemohon' }, 'test-secret');
      const request = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: {
          'authorization': `Bearer ${token}`
        },
        body: new FormData()
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Insufficient permissions');
    });

    test('should validate file type', async () => {
      const token = jwt.sign({ role: 'ADMIN' }, 'test-secret');
      const mockFile = {
        name: 'test.exe',
        type: 'application/x-executable',
        size: 1024,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
      };

      // Mock formData method
      const mockFormData = {
        get: jest.fn().mockReturnValue(mockFile)
      };

      const request = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'authorization') return `Bearer ${token}`;
            return null;
          })
        },
        formData: jest.fn().mockResolvedValue(mockFormData)
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid file type');
    });

    test('should handle server error', async () => {
      // Temporarily set NODE_ENV to production to avoid test environment bypass
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const token = jwt.sign({ role: 'ADMIN' }, 'test-secret');
      const mockFile = {
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        arrayBuffer: () => Promise.reject(new Error('File error'))
      };

      // Mock formData method
      const mockFormData = {
        get: jest.fn().mockReturnValue(mockFile)
      };

      const request = {
        headers: {
          get: jest.fn().mockImplementation((header) => {
            if (header === 'authorization') return `Bearer ${token}`;
            return null;
          })
        },
        formData: jest.fn().mockResolvedValue(mockFormData)
      };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Upload failed');
      
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalEnv;
    });
  });
});