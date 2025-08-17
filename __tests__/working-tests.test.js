const jwt = require('jsonwebtoken');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';

describe('PPID Garut - Core Functionality Tests', () => {
  describe('Authentication System', () => {
    test('should create valid JWT tokens', () => {
      const payload = { id: '1', role: 'ADMIN', email: 'admin@test.com' };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      expect(decoded.id).toBe('1');
      expect(decoded.role).toBe('ADMIN');
    });

    test('should validate different user roles', () => {
      const roles = ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID', 'Pemohon'];
      
      roles.forEach(role => {
        const token = jwt.sign({ id: '1', role }, process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.role).toBe(role);
      });
    });

    test('should reject invalid tokens', () => {
      expect(() => {
        jwt.verify('invalid-token', process.env.JWT_SECRET);
      }).toThrow();
    });

    test('should handle token expiration', () => {
      const expiredToken = jwt.sign(
        { id: '1', role: 'ADMIN' }, 
        process.env.JWT_SECRET, 
        { expiresIn: '-1h' }
      );
      
      expect(() => {
        jwt.verify(expiredToken, process.env.JWT_SECRET);
      }).toThrow();
    });
  });

  describe('Role-based Access Control', () => {
    test('should identify admin role correctly', () => {
      const isAdmin = (role) => role === 'ADMIN';
      
      expect(isAdmin('ADMIN')).toBe(true);
      expect(isAdmin('PPID_UTAMA')).toBe(false);
      expect(isAdmin('Pemohon')).toBe(false);
    });

    test('should identify PPID roles correctly', () => {
      const isPPID = (role) => ['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(role);
      
      expect(isPPID('PPID_UTAMA')).toBe(true);
      expect(isPPID('PPID_PELAKSANA')).toBe(true);
      expect(isPPID('ATASAN_PPID')).toBe(true);
      expect(isPPID('ADMIN')).toBe(false);
      expect(isPPID('Pemohon')).toBe(false);
    });

    test('should check permissions correctly', () => {
      const hasPermission = (userRole, allowedRoles) => {
        return allowedRoles.includes(userRole);
      };

      expect(hasPermission('ADMIN', ['ADMIN'])).toBe(true);
      expect(hasPermission('ADMIN', ['ADMIN', 'PPID_UTAMA'])).toBe(true);
      expect(hasPermission('Pemohon', ['ADMIN'])).toBe(false);
      expect(hasPermission('PPID_UTAMA', ['PPID_UTAMA', 'PPID_PELAKSANA'])).toBe(true);
    });

    test('should validate role hierarchy', () => {
      const roleHierarchy = {
        'ADMIN': 1,
        'PPID_UTAMA': 2,
        'ATASAN_PPID': 3,
        'PPID_PELAKSANA': 4,
        'Pemohon': 5
      };

      const hasHigherRole = (userRole, targetRole) => {
        return roleHierarchy[userRole] < roleHierarchy[targetRole];
      };

      expect(hasHigherRole('ADMIN', 'PPID_UTAMA')).toBe(true);
      expect(hasHigherRole('PPID_UTAMA', 'ADMIN')).toBe(false);
      expect(hasHigherRole('PPID_UTAMA', 'PPID_PELAKSANA')).toBe(true);
    });
  });

  describe('Data Validation', () => {
    test('should validate email format', () => {
      const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('admin@garutkab.go.id')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });

    test('should validate Indonesian phone numbers', () => {
      const validatePhone = (phone) => {
        const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
        return phoneRegex.test(phone);
      };

      expect(validatePhone('08123456789')).toBe(true);
      expect(validatePhone('628123456789')).toBe(true);
      expect(validatePhone('+628123456789')).toBe(true);
      expect(validatePhone('02621234567')).toBe(true);
      expect(validatePhone('123456789')).toBe(false);
      expect(validatePhone('abcd1234567')).toBe(false);
    });

    test('should validate password strength', () => {
      const validatePassword = (password) => {
        if (!password || typeof password !== 'string') return false;
        return password.length >= 6;
      };

      expect(validatePassword('password123')).toBe(true);
      expect(validatePassword('123456')).toBe(true);
      expect(validatePassword('12345')).toBe(false);
      expect(validatePassword('')).toBe(false);
      expect(validatePassword(null)).toBe(false);
      expect(validatePassword(undefined)).toBe(false);
    });

    test('should validate file types', () => {
      const validateFileType = (filename, allowedTypes) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        return allowedTypes.includes(ext);
      };

      const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'png'];
      
      expect(validateFileType('document.pdf', allowedTypes)).toBe(true);
      expect(validateFileType('image.jpg', allowedTypes)).toBe(true);
      expect(validateFileType('malware.exe', allowedTypes)).toBe(false);
      expect(validateFileType('script.js', allowedTypes)).toBe(false);
    });

    test('should validate file sizes', () => {
      const validateFileSize = (size, maxSize = 5 * 1024 * 1024) => {
        return size <= maxSize;
      };

      expect(validateFileSize(1024 * 1024)).toBe(true); // 1MB
      expect(validateFileSize(3 * 1024 * 1024)).toBe(true); // 3MB
      expect(validateFileSize(10 * 1024 * 1024)).toBe(false); // 10MB
    });
  });

  describe('Request Status Management', () => {
    test('should validate request statuses', () => {
      const validStatuses = ['Menunggu', 'Diproses', 'Selesai', 'Ditolak'];
      const isValidStatus = (status) => validStatuses.includes(status);

      expect(isValidStatus('Menunggu')).toBe(true);
      expect(isValidStatus('Diproses')).toBe(true);
      expect(isValidStatus('Selesai')).toBe(true);
      expect(isValidStatus('Ditolak')).toBe(true);
      expect(isValidStatus('Invalid')).toBe(false);
    });

    test('should validate status transitions', () => {
      const allowedTransitions = {
        'Menunggu': ['Diproses', 'Ditolak'],
        'Diproses': ['Selesai', 'Ditolak'],
        'Selesai': [],
        'Ditolak': []
      };

      const canTransition = (from, to) => {
        return allowedTransitions[from]?.includes(to) || false;
      };

      expect(canTransition('Menunggu', 'Diproses')).toBe(true);
      expect(canTransition('Menunggu', 'Ditolak')).toBe(true);
      expect(canTransition('Diproses', 'Selesai')).toBe(true);
      expect(canTransition('Selesai', 'Menunggu')).toBe(false);
      expect(canTransition('Ditolak', 'Diproses')).toBe(false);
    });

    test('should calculate working days', () => {
      const isWorkingDay = (date) => {
        const day = date.getDay();
        return day >= 1 && day <= 5; // Monday to Friday
      };

      expect(isWorkingDay(new Date('2024-01-01'))).toBe(true); // Monday
      expect(isWorkingDay(new Date('2024-01-05'))).toBe(true); // Friday
      expect(isWorkingDay(new Date('2024-01-06'))).toBe(false); // Saturday
      expect(isWorkingDay(new Date('2024-01-07'))).toBe(false); // Sunday
    });
  });

  describe('Security Features', () => {
    test('should sanitize HTML input', () => {
      const sanitizeHtml = (text) => {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      };

      expect(sanitizeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      
      expect(sanitizeHtml('Normal text')).toBe('Normal text');
    });

    test('should validate file paths for security', () => {
      const isSecurePath = (path) => {
        return !path.includes('..') && !path.includes('\\') && !path.startsWith('/');
      };

      expect(isSecurePath('document.pdf')).toBe(true);
      expect(isSecurePath('folder/document.pdf')).toBe(true);
      expect(isSecurePath('../../../etc/passwd')).toBe(false);
      expect(isSecurePath('..\\windows\\system32')).toBe(false);
      expect(isSecurePath('/etc/passwd')).toBe(false);
    });

    test('should validate URL format', () => {
      const isValidUrl = (url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('Business Logic', () => {
    test('should format file sizes correctly', () => {
      const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };

      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    test('should truncate text properly', () => {
      const truncateText = (text, maxLength) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
      };

      expect(truncateText('Short text', 20)).toBe('Short text');
      expect(truncateText('This is a very long text that should be truncated', 20))
        .toBe('This is a very long ...');
      expect(truncateText('', 10)).toBe('');
    });

    test('should validate required fields', () => {
      const validateRequiredFields = (data, requiredFields) => {
        const errors = {};
        
        requiredFields.forEach(field => {
          if (!data[field] || data[field].toString().trim() === '') {
            errors[field] = `${field} is required`;
          }
        });
        
        return errors;
      };

      const testData = { email: 'test@example.com', password: '', nama: 'Test User' };
      const errors = validateRequiredFields(testData, ['email', 'password', 'nama']);
      
      expect(Object.keys(errors)).toHaveLength(1);
      expect(errors.password).toBe('password is required');
    });

    test('should generate unique filenames', () => {
      const generateUniqueFilename = (originalName) => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const ext = originalName.split('.').pop();
        return `${timestamp}_${random}.${ext}`;
      };

      const filename1 = generateUniqueFilename('test.pdf');
      const filename2 = generateUniqueFilename('test.pdf');
      
      expect(filename1).not.toBe(filename2);
      expect(filename1).toMatch(/\.pdf$/);
      expect(filename2).toMatch(/\.pdf$/);
    });
  });

  describe('Database Operations Logic', () => {
    test('should handle pagination parameters', () => {
      const getPaginationParams = (page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        return { skip, take: limit };
      };

      expect(getPaginationParams(1, 10)).toEqual({ skip: 0, take: 10 });
      expect(getPaginationParams(2, 10)).toEqual({ skip: 10, take: 10 });
      expect(getPaginationParams(3, 5)).toEqual({ skip: 10, take: 5 });
    });

    test('should build search filters', () => {
      const buildSearchFilter = (searchTerm, fields) => {
        if (!searchTerm) return {};
        
        return {
          OR: fields.map(field => ({
            [field]: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }))
        };
      };

      const filter = buildSearchFilter('test', ['judul', 'deskripsi']);
      expect(filter.OR).toHaveLength(2);
      expect(filter.OR[0].judul.contains).toBe('test');
      expect(filter.OR[1].deskripsi.contains).toBe('test');
    });

    test('should handle date ranges', () => {
      const buildDateFilter = (startDate, endDate) => {
        const filter = {};
        
        if (startDate) {
          filter.gte = new Date(startDate);
        }
        
        if (endDate) {
          filter.lte = new Date(endDate);
        }
        
        return Object.keys(filter).length > 0 ? filter : undefined;
      };

      const filter1 = buildDateFilter('2024-01-01', '2024-12-31');
      expect(filter1.gte).toBeInstanceOf(Date);
      expect(filter1.lte).toBeInstanceOf(Date);

      const filter2 = buildDateFilter(null, null);
      expect(filter2).toBeUndefined();
    });
  });

  describe('API Response Formatting', () => {
    test('should format success responses', () => {
      const createSuccessResponse = (data, message = null) => {
        const response = { success: true, data };
        if (message) response.message = message;
        return response;
      };

      const response1 = createSuccessResponse({ id: 1, name: 'Test' });
      expect(response1.success).toBe(true);
      expect(response1.data.id).toBe(1);

      const response2 = createSuccessResponse([], 'No data found');
      expect(response2.success).toBe(true);
      expect(response2.message).toBe('No data found');
    });

    test('should format error responses', () => {
      const createErrorResponse = (error, status = 400) => {
        return { success: false, error, status };
      };

      const response1 = createErrorResponse('Validation failed');
      expect(response1.success).toBe(false);
      expect(response1.error).toBe('Validation failed');
      expect(response1.status).toBe(400);

      const response2 = createErrorResponse('Unauthorized', 401);
      expect(response2.status).toBe(401);
    });

    test('should handle pagination metadata', () => {
      const createPaginationMeta = (page, limit, total) => {
        return {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1
        };
      };

      const meta = createPaginationMeta(2, 10, 25);
      expect(meta.page).toBe(2);
      expect(meta.limit).toBe(10);
      expect(meta.total).toBe(25);
      expect(meta.totalPages).toBe(3);
      expect(meta.hasNext).toBe(true);
      expect(meta.hasPrev).toBe(true);
    });
  });

  describe('Utility Functions', () => {
    test('should generate activity logs', () => {
      const createActivityLog = (action, details, userId, userRole, ipAddress = 'unknown') => {
        return {
          action,
          details,
          user_id: userId.toString(),
          user_role: userRole,
          ip_address: ipAddress,
          created_at: new Date()
        };
      };

      const log = createActivityLog('LOGIN', 'User logged in', 1, 'ADMIN', '127.0.0.1');
      expect(log.action).toBe('LOGIN');
      expect(log.user_id).toBe('1');
      expect(log.user_role).toBe('ADMIN');
      expect(log.ip_address).toBe('127.0.0.1');
      expect(log.created_at).toBeInstanceOf(Date);
    });

    test('should handle JSON parsing safely', () => {
      const safeJsonParse = (jsonString, defaultValue = null) => {
        try {
          return JSON.parse(jsonString);
        } catch {
          return defaultValue;
        }
      };

      expect(safeJsonParse('{"key": "value"}')).toEqual({ key: 'value' });
      expect(safeJsonParse('invalid-json')).toBeNull();
      expect(safeJsonParse('invalid-json', {})).toEqual({});
    });

    test('should format dates for Indonesian locale', () => {
      const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID');
      };

      const testDate = new Date('2024-01-01');
      const formatted = formatDate(testDate);
      expect(typeof formatted).toBe('string');
      expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection errors', () => {
      const handleDbError = (error) => {
        if (error.code === 'P2002') {
          return { error: 'Duplicate entry', status: 400 };
        }
        if (error.code === 'P2003') {
          return { error: 'Foreign key constraint', status: 400 };
        }
        return { error: 'Database error', status: 500 };
      };

      expect(handleDbError({ code: 'P2002' })).toEqual({
        error: 'Duplicate entry',
        status: 400
      });

      expect(handleDbError({ code: 'P2003' })).toEqual({
        error: 'Foreign key constraint',
        status: 400
      });

      expect(handleDbError({ code: 'UNKNOWN' })).toEqual({
        error: 'Database error',
        status: 500
      });
    });

    test('should validate API request format', () => {
      const validateApiRequest = (req) => {
        const errors = [];
        
        if (!req.headers) errors.push('Headers missing');
        if (!req.headers?.['content-type']?.includes('application/json')) {
          errors.push('Invalid content type');
        }
        
        return errors;
      };

      const validReq = {
        headers: { 'content-type': 'application/json' }
      };
      
      const invalidReq = {
        headers: { 'content-type': 'text/plain' }
      };

      expect(validateApiRequest(validReq)).toHaveLength(0);
      expect(validateApiRequest(invalidReq)).toHaveLength(1);
      expect(validateApiRequest({})).toHaveLength(2);
    });
  });
});