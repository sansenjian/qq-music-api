import type { Mock } from 'vitest';
import {
  createController,
  validateRequired,
} from '../../../src/controllers/util';

describe('controllers/util', () => {
  let mockCtx: Record<string, unknown>;
  let mockNext: Mock;
  let mockApiFunction: Mock;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {},
      params: {},
    };
    mockNext = vi.fn();
    mockApiFunction = vi.fn();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createController', () => {
    test('should create a controller function', () => {
      const controller = createController(mockApiFunction);
      expect(typeof controller).toBe('function');
    });

    test('should call API function with correct params from query', async () => {
      mockCtx.query = { id: '123', name: 'test' };
      mockApiFunction.mockResolvedValue({ status: 200, body: { data: 'success' } });

      const controller = createController(mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(mockApiFunction).toHaveBeenCalledWith({
        method: 'get',
        params: { id: '123', name: 'test' },
        option: {}
      });
    });

    test('should call API function with params from ctx.params', async () => {
      mockCtx.params = { id: '456' };
      mockApiFunction.mockResolvedValue({ status: 200, body: {} });

      const controller = createController(mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(mockApiFunction).toHaveBeenCalledWith({
        method: 'get',
        params: { id: '456' },
        option: {}
      });
    });

    test('should merge query and params, with params taking precedence', async () => {
      mockCtx.query = { id: '123' };
      mockCtx.params = { id: '456' };
      mockApiFunction.mockResolvedValue({ status: 200, body: {} });

      const controller = createController(mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(mockApiFunction).toHaveBeenCalledWith({
        method: 'get',
        params: { id: '456' },
        option: {}
      });
    });

    test('should set response status and body from API result', async () => {
      mockApiFunction.mockResolvedValue({ status: 201, body: { result: 'ok' } });

      const controller = createController(mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(mockCtx.status).toBe(201);
      expect(mockCtx.body).toEqual({ result: 'ok' });
    });

    test('should use validator to validate params', async () => {
      const validator = vi.fn().mockReturnValue({ valid: false, error: 'Invalid' });
      const controller = createController(mockApiFunction, { validator });

      await controller(mockCtx, mockNext);

      expect(validator).toHaveBeenCalledWith({});
      expect(mockCtx.status).toBe(400);
      expect(mockCtx.body).toEqual({ response: 'Invalid' });
      expect(mockApiFunction).not.toHaveBeenCalled();
    });

    test('should use custom errorMessage when validation fails', async () => {
      const validator = vi.fn().mockReturnValue({ valid: false });
      const controller = createController(mockApiFunction, {
        validator,
        errorMessage: 'Custom error'
      });

      await controller(mockCtx, mockNext);

      expect(mockCtx.status).toBe(400);
      expect(mockCtx.body).toEqual({ response: 'Custom error' });
    });

    test('should call API when validator passes', async () => {
      const validator = vi.fn().mockReturnValue({ valid: true });
      mockApiFunction.mockResolvedValue({ status: 200, body: {} });

      const controller = createController(mockApiFunction, { validator });
      await controller(mockCtx, mockNext);

      expect(validator).toHaveBeenCalled();
      expect(mockApiFunction).toHaveBeenCalled();
    });

    test('should allow custom API options mapping', async () => {
      mockCtx.query = { id: '123' };
      mockCtx.params = { kind: 'playlist' };
      mockApiFunction.mockResolvedValue({ status: 200, body: {} });

      const buildApiOptions = vi.fn((_ctx, params) => ({
        method: 'post',
        params,
        option: {
          headers: {
            'x-test': '1'
          }
        }
      }));

      const controller = createController(mockApiFunction, { buildApiOptions });
      await controller(mockCtx, mockNext);

      expect(buildApiOptions).toHaveBeenCalledWith(mockCtx, { id: '123', kind: 'playlist' });
      expect(mockApiFunction).toHaveBeenCalledWith({
        method: 'post',
        params: { id: '123', kind: 'playlist' },
        option: {
          headers: {
            'x-test': '1'
          }
        }
      });
    });

    test('should not build API options when validation fails', async () => {
      const validator = vi.fn().mockReturnValue({ valid: false, error: 'Invalid' });
      const buildApiOptions = vi.fn();
      const controller = createController(mockApiFunction, { validator, buildApiOptions });

      await controller(mockCtx, mockNext);

      expect(buildApiOptions).not.toHaveBeenCalled();
      expect(mockApiFunction).not.toHaveBeenCalled();
      expect(mockCtx.status).toBe(400);
      expect(mockCtx.body).toEqual({ response: 'Invalid' });
    });

    test('should handle errors with custom onError handler', async () => {
      const onError = vi.fn();
      mockApiFunction.mockRejectedValue(new Error('API error'));

      const controller = createController(mockApiFunction, { onError });
      await controller(mockCtx, mockNext);

      expect(onError).toHaveBeenCalledWith(mockCtx, expect.any(Error));
    });

    test('should handle errors with default handler when onError is not provided', async () => {
      mockApiFunction.mockRejectedValue(new Error('API error'));

      const controller = createController(mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(mockCtx.status).toBe(500);
      expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('validateRequired', () => {
    test('should return valid when all required fields are present', () => {
      const validator = validateRequired(['name', 'age']);
      const result = validator({ name: 'John', age: 30 });

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should return invalid when required field is missing', () => {
      const validator = validateRequired(['name', 'age']);
      const result = validator({ name: 'John' });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('缺少必需参数');
      expect(result.error).toContain('age');
    });

    test('should return invalid when multiple required fields are missing', () => {
      const validator = validateRequired(['name', 'age', 'email']);
      const result = validator({});

      expect(result.valid).toBe(false);
      expect(result.error).toContain('缺少必需参数');
      expect(result.error).toContain('name');
      expect(result.error).toContain('age');
      expect(result.error).toContain('email');
    });

    test('should return invalid when field value is empty string', () => {
      const validator = validateRequired(['name']);
      const result = validator({ name: '' });

      expect(result.valid).toBe(false);
    });

    test('should return invalid when field value is whitespace string', () => {
      const validator = validateRequired(['name']);
      const result = validator({ name: '   ' });

      expect(result.valid).toBe(false);
    });

    test('should return invalid when field value is null', () => {
      const validator = validateRequired(['name']);
      const result = validator({ name: null });

      expect(result.valid).toBe(false);
    });

    test('should return invalid when field value is undefined', () => {
      const validator = validateRequired(['name']);
      const result = validator({ age: 30 });

      expect(result.valid).toBe(false);
    });

    test('should return valid when field value is 0', () => {
      const validator = validateRequired(['count']);
      const result = validator({ count: 0 });

      expect(result.valid).toBe(true);
    });

    test('should return valid when field value is false', () => {
      const validator = validateRequired(['active']);
      const result = validator({ active: false });

      expect(result.valid).toBe(true);
    });
  });
});
