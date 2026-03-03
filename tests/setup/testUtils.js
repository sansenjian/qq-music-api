/**
 * Test utilities for QQ Music API tests
 */

const path = require('path');
const fs = require('fs');

/**
 * Load test fixture from file
 * @param {string} fixtureName - Name of the fixture file
 * @returns {any} Parsed fixture data
 */
function loadFixture(fixtureName) {
  const fixturePath = path.join(__dirname, 'fixtures', fixtureName);
  const data = fs.readFileSync(fixturePath, 'utf8');
  return JSON.parse(data);
}

/**
 * Create a mock Koa context
 * @param {Object} options - Context options
 * @returns {Object} Mock context
 */
function createMockContext(options = {}) {
  const {
    params = {},
    query = {},
    body = {},
    headers = {},
    method = 'GET'
  } = options;

  return {
    params,
    query,
    request: {
      body,
      headers,
      method
    },
    body: null,
    status: 200,
    set: jest.fn(),
    get: jest.fn()
  };
}

/**
 * Create a mock next function
 * @returns {Function} Mock next function
 */
function createMockNext() {
  return jest.fn().mockResolvedValue(undefined);
}

/**
 * Wait for async operations
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random string
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
function randomString(length = 10) {
  return Math.random().toString(36).substring(2, length + 2);
}

/**
 * Generate random integer
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random integer
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Assert that response has correct structure
 * @param {Object} response - Response object
 * @param {number} expectedStatus - Expected status code
 */
function assertResponseStructure(response, expectedStatus = 200) {
  expect(response).toBeDefined();
  expect(response.status).toBe(expectedStatus);
  if (expectedStatus === 200) {
    expect(response.body).toBeDefined();
    expect(response.body.code).toBeDefined();
  }
}

module.exports = {
  loadFixture,
  createMockContext,
  createMockNext,
  sleep,
  randomString,
  randomInt,
  assertResponseStructure
};
