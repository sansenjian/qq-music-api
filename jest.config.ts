import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'module/**/*.ts',
    'routers/**/*.ts',
    'util/**/*.ts',
    'middlewares/**/*.ts',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/dist/**',
    '!**/*.d.ts',
    '!**/types/**/*.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary', 'json'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/tests/',
    '/dist/',
    '\\.d\\.ts$',
    '/types/'
  ],
  coverageThreshold: {
    global: {
      branches: 35,
      functions: 40,
      lines: 50,
      statements: 50
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testTimeout: 10000,
  verbose: true,
  collectCoverage: true, // 默认开启覆盖率
  coverageProvider: 'v8', // 使用 v8 引擎，更准确
  moduleNameMapper: {
    '^@module/(.*)$': '<rootDir>/module/$1',
    '^@routers/(.*)$': '<rootDir>/routers/$1',
    '^@util/(.*)$': '<rootDir>/util/$1'
  },
  transform: {
    '^.+[.]ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  }
};

export default config;
