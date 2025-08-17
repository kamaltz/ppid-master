module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '**/__tests__/**/*.test.{js,jsx,ts,tsx}',
    '**/__tests__/**/*.spec.{js,jsx,ts,tsx}'
  ],
  testTimeout: 30000,
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(supertest)/)'
  ],
  // Coverage configuration
  collectCoverageFrom: [
    'src/app/api/**/*.{js,ts}',
    'lib/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/app/globals.css',
    '!**/*.config.{js,ts}',
    '!**/node_modules/**',
    '!src/app/**/page.tsx',
    '!src/app/**/layout.tsx',
    '!src/components/**/*.tsx'
  ],
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^../../../lib/lib/prismaClient$': '<rootDir>/__mocks__/lib/lib/prismaClient.ts',
    '^../../../../lib/lib/prismaClient$': '<rootDir>/__mocks__/lib/lib/prismaClient.ts'
  },
  // Verbose output
  verbose: true,
  // Clear mocks between tests
  clearMocks: true,
  // Restore mocks after each test
  restoreMocks: true,
  // Test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
};