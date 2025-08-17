// Jest setup file for Node.js environment

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';



// Mock fetch globally with proper response structure
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve('{}'),
    headers: new Map()
  })
);

// Mock localStorage for Node.js environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
global.localStorage = localStorageMock;

// Mock sessionStorage for Node.js environment
const sessionStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
global.sessionStorage = sessionStorageMock;

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  if (global.fetch && global.fetch.mockClear) {
    global.fetch.mockClear();
  }
  if (global.localStorage && global.localStorage.clear) {
    global.localStorage.clear();
  }
  if (global.sessionStorage && global.sessionStorage.clear) {
    global.sessionStorage.clear();
  }
});

