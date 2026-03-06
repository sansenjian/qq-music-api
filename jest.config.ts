import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: [
    'module/**/*.ts',
    'routers/**/*.ts',
    'util/**/*.ts',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/dist/**'
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
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testTimeout: 10000,
  verbose: true,
  moduleNameMapper: {
    '^@module/(.*)$': '<rootDir>/module/$1',
    '^@routers/(.*)$': '<rootDir>/routers/$1',
    '^@util/(.*)$': '<rootDir>/util/$1'
  },
  transform: {
    '^.+\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json'
    }]
  }
};

export default config;
