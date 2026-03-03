module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'module/**/*.js',
    'routers/**/*.js',
    'util/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
  testTimeout: 10000,
  verbose: true,
  moduleNameMapper: {
    '^@module/(.*)$': '<rootDir>/module/$1',
    '^@routers/(.*)$': '<rootDir>/routers/$1',
    '^@util/(.*)$': '<rootDir>/util/$1'
  }
};
