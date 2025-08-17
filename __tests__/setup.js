const jwt = require('jsonwebtoken');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock fetch globally with proper response structure
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true }),
    text: () => Promise.resolve('{}'),
    headers: new Map()
  })
);

// Test database setup
const testDb = {
  admin: [
    { id: 1, email: 'admin@test.com', password: 'hashedpassword', role: 'ADMIN' }
  ],
  pemohon: [
    { id: 1, email: 'pemohon@test.com', nama: 'Test Pemohon', role: 'Pemohon' }
  ],
  ppid: [
    { id: 1, email: 'ppid@test.com', nama: 'Test PPID', role: 'PPID_UTAMA' }
  ]
};

// Mock JWT tokens
const createTestToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};

const testTokens = {
  admin: createTestToken({ id: '1', role: 'ADMIN', email: 'admin@test.com' }),
  pemohon: createTestToken({ id: '1', role: 'Pemohon', email: 'pemohon@test.com' }),
  ppid: createTestToken({ id: '1', role: 'PPID_UTAMA', email: 'ppid@test.com' }),
  invalid: 'invalid-token'
};

// Mock Prisma client
const mockPrisma = {
  admin: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  pemohon: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  ppid: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  permintaan: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  informasi: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  keberatan: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  kategori: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  },
  activityLog: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn()
  },
  settings: {
    findUnique: jest.fn(),
    upsert: jest.fn()
  }
};

// Test utilities
const testUtils = {
  createAuthHeaders: (token) => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }),
  
  mockFetch: (url, options = {}) => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve('{}'),
      headers: new Map()
    };
    
    global.fetch.mockResolvedValue(mockResponse);
    return global.fetch(url, options);
  },

  mockRequest: (method, url, body = null, headers = {}) => ({
    method,
    url,
    headers: new Headers(headers),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body))
  }),

  expectSuccessResponse: (response, expectedData = null) => {
    expect(response.status).toBe(200);
    if (expectedData) {
      expect(response.data).toEqual(expect.objectContaining(expectedData));
    }
  },

  expectErrorResponse: (response, expectedStatus, expectedMessage = null) => {
    expect(response.status).toBe(expectedStatus);
    if (expectedMessage) {
      expect(response.error).toContain(expectedMessage);
    }
  }
};

module.exports = {
  testDb,
  testTokens,
  mockPrisma,
  testUtils,
  createTestToken
};