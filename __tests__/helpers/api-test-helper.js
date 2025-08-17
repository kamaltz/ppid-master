const jwt = require('jsonwebtoken');

// Mock API response helper
const createMockResponse = (status = 200, data = {}, error = null) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(error ? { error } : data),
  text: () => Promise.resolve(JSON.stringify(error ? { error } : data)),
  headers: new Map()
});

// Mock fetch with configurable responses
const mockFetchResponse = (status, data, error = null) => {
  global.fetch.mockResolvedValueOnce(createMockResponse(status, data, error));
};

// Create test tokens
const createTestToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};

// Test tokens for different roles
const testTokens = {
  admin: createTestToken({ id: '1', role: 'ADMIN', email: 'admin@test.com' }),
  pemohon: createTestToken({ id: '1', role: 'Pemohon', email: 'pemohon@test.com' }),
  ppid: createTestToken({ id: '1', role: 'PPID_UTAMA', email: 'ppid@test.com' }),
  ppidPelaksana: createTestToken({ id: '2', role: 'PPID_PELAKSANA', email: 'pelaksana@test.com' }),
  atasanPpid: createTestToken({ id: '3', role: 'ATASAN_PPID', email: 'atasan@test.com' }),
  invalid: 'invalid-token'
};

// Create auth headers
const createAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Simple mock request helper
const createMockRequest = (method = 'GET', url = '/', body = null, headers = {}) => {
  return {
    method,
    url,
    body,
    headers,
    query: {},
    params: {}
  };
};

// Test utilities
const testUtils = {
  // Mock successful responses
  mockSuccess: (data = {}, status = 200) => {
    mockFetchResponse(status, data);
  },

  // Mock error responses
  mockError: (message = 'Error', status = 400) => {
    mockFetchResponse(status, null, message);
  },

  // Mock authentication responses
  mockAuthSuccess: (user, token) => {
    mockFetchResponse(200, { user, token });
  },

  mockAuthError: (message = 'Unauthorized', status = 401) => {
    mockFetchResponse(status, null, message);
  },

  // Mock CRUD operations
  mockCreate: (data, status = 201) => {
    mockFetchResponse(status, data);
  },

  mockUpdate: (data, status = 200) => {
    mockFetchResponse(status, data);
  },

  mockDelete: (status = 200) => {
    mockFetchResponse(status, { message: 'Deleted successfully' });
  },

  mockNotFound: (message = 'Not found') => {
    mockFetchResponse(404, null, message);
  },

  mockForbidden: (message = 'Forbidden') => {
    mockFetchResponse(403, null, message);
  },

  // Validation helpers
  expectSuccess: (response, expectedData = null) => {
    expect(response.status).toBe(200);
    if (expectedData) {
      expect(response.data).toEqual(expect.objectContaining(expectedData));
    }
  },

  expectError: (response, expectedStatus, expectedMessage = null) => {
    expect(response.status).toBe(expectedStatus);
    if (expectedMessage) {
      expect(response.error).toContain(expectedMessage);
    }
  },

  expectCreated: (response, expectedData = null) => {
    expect(response.status).toBe(201);
    if (expectedData) {
      expect(response.data).toEqual(expect.objectContaining(expectedData));
    }
  }
};

module.exports = {
  createMockResponse,
  mockFetchResponse,
  createTestToken,
  testTokens,
  createAuthHeaders,
  createMockRequest,
  testUtils
};