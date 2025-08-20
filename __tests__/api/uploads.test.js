const { GET } = require('../../src/app/api/uploads/[...path]/route');
const fs = require('fs');
const path = require('path');

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

// Mock mime-types
jest.mock('mime-types', () => ({
  lookup: jest.fn(),
}));

const mimeTypes = require('mime-types');

describe('/api/uploads/[...path]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should serve existing file', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(Buffer.from('test file content'));
    mimeTypes.lookup.mockReturnValue('image/jpeg');

    const mockRequest = {};
    const response = await GET(mockRequest, { params: { path: ['images', 'test.jpg'] } });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/jpeg');
  });

  it('should return 404 for non-existent file', async () => {
    fs.existsSync.mockReturnValue(false);

    const mockRequest = {};
    const response = await GET(mockRequest, { params: { path: ['images', 'nonexistent.jpg'] } });
    expect(response.status).toBe(404);
  });

  it('should handle file read error', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockImplementation(() => {
      throw new Error('File read error');
    });

    const mockRequest = {};
    const response = await GET(mockRequest, { params: { path: ['images', 'test.jpg'] } });
    expect(response.status).toBe(500);
  });
});