# 🧪 PPID Garut - Comprehensive Testing Suite

Sistem testing lengkap untuk aplikasi PPID Garut yang mencakup semua endpoint API, komponen, dan fitur aplikasi.

## 📋 Struktur Testing

```
__tests__/
├── api/                    # API endpoint tests
│   ├── auth.test.js       # Authentication tests
│   ├── admin.test.js      # Admin functionality tests
│   ├── permintaan.test.js # Request management tests
│   ├── informasi.test.js  # Information management tests
│   ├── keberatan.test.js  # Objection management tests
│   ├── kategori.test.js   # Category management tests
│   ├── upload.test.js     # File upload tests
│   └── settings.test.js   # Settings management tests
├── components/            # React component tests
│   └── auth.test.jsx     # Authentication component tests
├── integration/           # Integration tests
│   └── complete-flow.test.js # End-to-end workflow tests
├── utils/                 # Utility function tests
│   └── validation.test.js # Validation utility tests
├── setup.js              # Test setup and utilities
├── run-all-tests.js      # Comprehensive test runner
└── README.md             # This file
```

## 🚀 Menjalankan Tests

### Semua Tests
```bash
# Menjalankan semua tests
npm run test:all

# Menjalankan tests dengan Jest
npm test

# Menjalankan tests dengan coverage
npm run test:coverage

# Menjalankan tests dalam watch mode
npm run test:watch
```

### Tests Berdasarkan Fitur
```bash
# Authentication tests
npm run test:auth

# Admin functionality tests
npm run test:admin

# Request management tests
npm run test:requests

# Information management tests
npm run test:information

# Objection management tests
npm run test:objections

# Category management tests
npm run test:categories

# File upload tests
npm run test:uploads

# Settings management tests
npm run test:settings

# Integration tests
npm run test:integration

# Utility tests
npm run test:utils
```

## 📊 Coverage Testing

Sistem testing ini mencakup:

### API Endpoints (100% Coverage)
- ✅ **Authentication** - Login, register, logout
- ✅ **Admin Management** - Stats, users, logs, permissions
- ✅ **Request Management** - CRUD operations, status updates
- ✅ **Information Management** - CRUD operations, publishing
- ✅ **Objection Management** - CRUD operations, processing
- ✅ **Category Management** - CRUD operations
- ✅ **File Upload** - Validation, storage, security
- ✅ **Settings Management** - Configuration, validation

### User Roles Testing
- ✅ **Admin** - Full access testing
- ✅ **PPID Utama** - Management access testing
- ✅ **PPID Pelaksana** - Processing access testing
- ✅ **Atasan PPID** - Approval access testing
- ✅ **Pemohon** - User access testing

### Security Testing
- ✅ **Authentication** - Token validation, role-based access
- ✅ **Authorization** - Permission checking, access control
- ✅ **Input Validation** - SQL injection, XSS prevention
- ✅ **File Upload Security** - Type validation, size limits

### Error Handling Testing
- ✅ **Database Errors** - Connection failures, query errors
- ✅ **Validation Errors** - Invalid input handling
- ✅ **Authentication Errors** - Invalid tokens, expired sessions
- ✅ **Authorization Errors** - Unauthorized access attempts

## 🔧 Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}
```

### Environment Variables
```bash
NODE_ENV=test
JWT_SECRET=test-secret-key
DATABASE_URL=test-database-url
```

## 📝 Test Data

### Mock Users
```javascript
const testUsers = {
  admin: { id: 1, role: 'ADMIN', email: 'admin@test.com' },
  pemohon: { id: 1, role: 'Pemohon', email: 'pemohon@test.com' },
  ppid: { id: 1, role: 'PPID_UTAMA', email: 'ppid@test.com' }
}
```

### Mock Tokens
```javascript
const testTokens = {
  admin: 'valid-admin-token',
  pemohon: 'valid-pemohon-token',
  ppid: 'valid-ppid-token',
  invalid: 'invalid-token'
}
```

## 🧪 Test Examples

### API Endpoint Test
```javascript
describe('POST /api/permintaan', () => {
  test('should create new request for pemohon', async () => {
    const response = await fetch('/api/permintaan', {
      method: 'POST',
      headers: testUtils.createAuthHeaders(testTokens.pemohon),
      body: JSON.stringify({
        judul: 'Test Request',
        deskripsi: 'Test Description'
      })
    });

    expect(response.status).toBe(201);
  });
});
```

### Component Test
```javascript
test('should handle successful login', async () => {
  render(
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );

  fireEvent.click(screen.getByTestId('login-btn'));
  
  await waitFor(() => {
    expect(screen.getByTestId('user-name')).toBeInTheDocument();
  });
});
```

### Integration Test
```javascript
test('should complete full information request process', async () => {
  // Step 1: Create request
  const createResponse = await fetch('/api/permintaan', {
    method: 'POST',
    headers: testUtils.createAuthHeaders(userToken),
    body: JSON.stringify(requestData)
  });

  // Step 2: Process request
  const processResponse = await fetch(`/api/permintaan/${requestId}`, {
    method: 'PUT',
    headers: testUtils.createAuthHeaders(ppidToken),
    body: JSON.stringify(updateData)
  });

  expect(createResponse.status).toBe(201);
  expect(processResponse.status).toBe(200);
});
```

## 📈 Test Reports

### Coverage Report
```bash
npm run test:coverage
```

Generates:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV coverage data
- Console coverage summary

### Test Results
```bash
npm run test:all
```

Provides:
- ✅ Passed tests count
- ❌ Failed tests count
- 📊 Success rate percentage
- ⏱️ Execution time
- 📋 Detailed failure reports

## 🔍 Debugging Tests

### Run Specific Test File
```bash
npx jest __tests__/api/auth.test.js --verbose
```

### Run Tests with Debug Output
```bash
DEBUG=* npm test
```

### Run Single Test Case
```bash
npx jest --testNamePattern="should create new request"
```

## 🛠️ Test Utilities

### Authentication Helper
```javascript
const authHeaders = testUtils.createAuthHeaders(token);
```

### Response Validation
```javascript
testUtils.expectSuccessResponse(response, expectedData);
testUtils.expectErrorResponse(response, 400, 'Validation error');
```

### Mock Data Generation
```javascript
const mockRequest = testUtils.mockRequest('POST', '/api/test', data);
```

## 📚 Best Practices

### Test Structure
1. **Arrange** - Setup test data and mocks
2. **Act** - Execute the function/endpoint
3. **Assert** - Verify the results

### Naming Convention
- Test files: `*.test.js` or `*.spec.js`
- Test descriptions: Clear, descriptive names
- Test groups: Logical grouping with `describe()`

### Mock Strategy
- Mock external dependencies
- Use consistent test data
- Clean up mocks between tests

### Error Testing
- Test both success and failure cases
- Validate error messages and status codes
- Test edge cases and boundary conditions

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Ensure test database is running
   npm run db:migrate
   ```

2. **Token Validation Errors**
   ```bash
   # Check JWT_SECRET environment variable
   export JWT_SECRET=test-secret-key
   ```

3. **File Upload Tests Failing**
   ```bash
   # Ensure uploads directory exists
   mkdir -p public/uploads
   ```

### Debug Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- __tests__/api/auth.test.js

# Run tests with coverage
npm test -- --coverage
```

## 📞 Support

Untuk bantuan dengan testing:
1. Periksa log error di console
2. Pastikan environment variables sudah benar
3. Verifikasi database connection
4. Cek mock data dan setup

---

**Sistem testing ini memastikan kualitas dan keandalan aplikasi PPID Garut** 🏛️