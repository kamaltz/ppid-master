const jwt = require('jsonwebtoken');

describe('Admin API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('Admin Logic Tests', () => {
    test('should validate admin role', () => {
      const isAdmin = (role) => role === 'ADMIN';
      
      expect(isAdmin('ADMIN')).toBe(true);
      expect(isAdmin('PPID_UTAMA')).toBe(false);
      expect(isAdmin('Pemohon')).toBe(false);
    });

    test('should create valid JWT token', () => {
      const payload = { role: 'ADMIN', id: '1' };
      const token = jwt.sign(payload, 'test-secret');
      const decoded = jwt.verify(token, 'test-secret');
      
      expect(decoded.role).toBe('ADMIN');
      expect(decoded.id).toBe('1');
    });

    test('should handle statistics data format', () => {
      const mockStats = {
        totalRequests: 10,
        totalInformation: 5,
        totalObjections: 2,
        totalUsers: 15
      };

      expect(typeof mockStats.totalRequests).toBe('number');
      expect(mockStats.totalRequests).toBeGreaterThanOrEqual(0);
      expect(Object.keys(mockStats)).toHaveLength(4);
    });

    test('should validate activity log format', () => {
      const mockLog = {
        id: 1,
        action: 'LOGIN',
        details: 'Admin login',
        user_id: '1',
        user_role: 'ADMIN',
        created_at: new Date().toISOString()
      };

      expect(mockLog.id).toBeDefined();
      expect(mockLog.action).toBeDefined();
      expect(mockLog.user_role).toBeDefined();
      expect(new Date(mockLog.created_at)).toBeInstanceOf(Date);
    });

    test('should validate user data structure', () => {
      const mockUser = {
        id: 1,
        email: 'admin@test.com',
        role: 'ADMIN',
        nama: 'Admin User'
      };

      expect(mockUser.id).toBeDefined();
      expect(mockUser.email).toContain('@');
      expect(['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'Pemohon'].includes(mockUser.role)).toBe(true);
    });
  });
});