// Jest setup file
// Global setup for all tests

// Increase timeout for async operations
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Global test utilities
global.testUtils = {
  // Generate random string
  randomString: (length = 10) => {
    return Math.random().toString(36).substring(2, length + 2);
  },

  // Wait for specified milliseconds
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Create mock response
  mockResponse: (data = {}) => ({
    status: 200,
    data: data,
    json: jest.fn().mockReturnValue(data)
  }),

  // Create mock request
  mockRequest: (params = {}, query = {}, body = {}) => ({
    params: params,
    query: query,
    body: body,
    headers: {}
  })
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
