// Test utility functions and validation logic

describe('Validation Utilities', () => {
  describe('Email validation', () => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    test('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.id',
        'admin@garutkab.go.id',
        'pemohon123@gmail.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user name@domain.com',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Phone number validation', () => {
    const validatePhone = (phone) => {
      const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
      return phoneRegex.test(phone);
    };

    test('should validate Indonesian phone numbers', () => {
      const validPhones = [
        '08123456789',
        '628123456789',
        '+628123456789',
        '02621234567'
      ];

      validPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(true);
      });
    });

    test('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123456789',
        '08123',
        'abcd1234567',
        '+1234567890',
        ''
      ];

      invalidPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(false);
      });
    });
  });

  describe('Password validation', () => {
    const validatePassword = (password) => {
      return Boolean(password && typeof password === 'string' && password.length >= 6);
    };

    test('should validate strong passwords', () => {
      const validPasswords = [
        'password123',
        'strongPass',
        '123456',
        'P@ssw0rd!'
      ];

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    test('should reject weak passwords', () => {
      const invalidPasswords = [
        '12345',
        '',
        'abc',
        null,
        undefined
      ];

      invalidPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });
  });

  describe('File validation', () => {
    const validateFileType = (filename, allowedTypes) => {
      const ext = filename.split('.').pop()?.toLowerCase();
      return allowedTypes.includes(ext);
    };

    const validateFileSize = (size, maxSize = 5 * 1024 * 1024) => {
      return size <= maxSize;
    };

    test('should validate allowed file types', () => {
      const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'png'];
      
      expect(validateFileType('document.pdf', allowedTypes)).toBe(true);
      expect(validateFileType('image.jpg', allowedTypes)).toBe(true);
      expect(validateFileType('file.docx', allowedTypes)).toBe(true);
    });

    test('should reject disallowed file types', () => {
      const allowedTypes = ['pdf', 'doc', 'docx'];
      
      expect(validateFileType('malware.exe', allowedTypes)).toBe(false);
      expect(validateFileType('script.js', allowedTypes)).toBe(false);
      expect(validateFileType('archive.zip', allowedTypes)).toBe(false);
    });

    test('should validate file sizes', () => {
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      expect(validateFileSize(1024 * 1024, maxSize)).toBe(true); // 1MB
      expect(validateFileSize(3 * 1024 * 1024, maxSize)).toBe(true); // 3MB
      expect(validateFileSize(10 * 1024 * 1024, maxSize)).toBe(false); // 10MB
    });
  });

  describe('Role validation', () => {
    const hasPermission = (userRole, requiredRoles) => {
      return requiredRoles.includes(userRole);
    };

    const isAdmin = (role) => role === 'ADMIN';
    const isPPID = (role) => ['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(role);
    const isPemohon = (role) => role === 'Pemohon';

    test('should validate admin permissions', () => {
      expect(hasPermission('ADMIN', ['ADMIN'])).toBe(true);
      expect(hasPermission('ADMIN', ['ADMIN', 'PPID_UTAMA'])).toBe(true);
      expect(hasPermission('Pemohon', ['ADMIN'])).toBe(false);
    });

    test('should validate PPID permissions', () => {
      expect(hasPermission('PPID_UTAMA', ['PPID_UTAMA', 'ADMIN'])).toBe(true);
      expect(hasPermission('PPID_PELAKSANA', ['PPID_PELAKSANA'])).toBe(true);
      expect(hasPermission('Pemohon', ['PPID_UTAMA'])).toBe(false);
    });

    test('should identify role types correctly', () => {
      expect(isAdmin('ADMIN')).toBe(true);
      expect(isAdmin('PPID_UTAMA')).toBe(false);

      expect(isPPID('PPID_UTAMA')).toBe(true);
      expect(isPPID('PPID_PELAKSANA')).toBe(true);
      expect(isPPID('ATASAN_PPID')).toBe(true);
      expect(isPPID('ADMIN')).toBe(false);

      expect(isPemohon('Pemohon')).toBe(true);
      expect(isPemohon('ADMIN')).toBe(false);
    });
  });

  describe('Date validation', () => {
    const isValidDate = (dateString) => {
      const date = new Date(dateString);
      return date instanceof Date && !isNaN(date);
    };

    const isWorkingDay = (date) => {
      const day = date.getDay();
      return day >= 1 && day <= 5; // Monday to Friday
    };

    const addWorkingDays = (startDate, days) => {
      let currentDate = new Date(startDate);
      let addedDays = 0;

      while (addedDays < days) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (isWorkingDay(currentDate)) {
          addedDays++;
        }
      }

      return currentDate;
    };

    test('should validate date strings', () => {
      expect(isValidDate('2024-01-01')).toBe(true);
      expect(isValidDate('2024-12-31T23:59:59Z')).toBe(true);
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });

    test('should identify working days', () => {
      expect(isWorkingDay(new Date('2024-01-01'))).toBe(true); // Monday
      expect(isWorkingDay(new Date('2024-01-05'))).toBe(true); // Friday
      expect(isWorkingDay(new Date('2024-01-06'))).toBe(false); // Saturday
      expect(isWorkingDay(new Date('2024-01-07'))).toBe(false); // Sunday
    });

    test('should calculate working days correctly', () => {
      const startDate = new Date('2024-01-01'); // Monday
      const result = addWorkingDays(startDate, 5);
      
      // Should skip weekend and add 5 working days
      expect(result.getDate()).toBe(8); // Next Monday
    });
  });

  describe('Text sanitization', () => {
    const sanitizeHtml = (text) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
    };

    const truncateText = (text, maxLength) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    };

    test('should sanitize HTML characters', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      
      expect(sanitizeHtml('Normal text')).toBe('Normal text');
      
      expect(sanitizeHtml('<div class="test">Content</div>'))
        .toBe('&lt;div class=&quot;test&quot;&gt;Content&lt;/div&gt;');
    });

    test('should truncate text properly', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
      expect(truncateText('This is a very long text that should be truncated', 20))
        .toBe('This is a very long ...');
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('URL validation', () => {
    const isValidUrl = (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    };

    const isHttpsUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    };

    test('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });

    test('should validate HTTPS URLs', () => {
      expect(isHttpsUrl('https://example.com')).toBe(true);
      expect(isHttpsUrl('http://example.com')).toBe(false);
      expect(isHttpsUrl('ftp://example.com')).toBe(false);
      expect(isHttpsUrl('not-a-url')).toBe(false);
    });
  });
});