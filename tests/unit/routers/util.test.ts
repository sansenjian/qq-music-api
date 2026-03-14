import {
  createController,
  createPostController,
  validateRequired,
  handleControllerResponse,
  createCustomController
} from '../../../routers/util';
import type { KoaContext } from '../../../routers/types';

describe('routers/util', () => {
  let mockCtx: any;
  let mockNext: jest.Mock;
  let mockApiFunction: jest.Mock;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null,
      query: {},
      params: {},
      request: {
        body: {}
      }
    };
    mockNext = jest.fn();
    mockApiFunction = jest.fn();
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
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
      const validator = jest.fn().mockReturnValue({ valid: false, error: 'Invalid' });
      const controller = createController(mockApiFunction, { validator });

      await controller(mockCtx, mockNext);

      expect(validator).toHaveBeenCalledWith({});
      expect(mockCtx.status).toBe(400);
      expect(mockCtx.body).toEqual({ response: 'Invalid' });
      expect(mockApiFunction).not.toHaveBeenCalled();
    });

    test('should use custom errorMessage when validation fails', async () => {
      const validator = jest.fn().mockReturnValue({ valid: false });
      const controller = createController(mockApiFunction, {
        validator,
        errorMessage: 'Custom error'
      });

      await controller(mockCtx, mockNext);

      expect(mockCtx.status).toBe(400);
      expect(mockCtx.body).toEqual({ response: 'Custom error' });
    });

    test('should call API when validator passes', async () => {
      const validator = jest.fn().mockReturnValue({ valid: true });
      mockApiFunction.mockResolvedValue({ status: 200, body: {} });

      const controller = createController(mockApiFunction, { validator });
      await controller(mockCtx, mockNext);

      expect(validator).toHaveBeenCalled();
      expect(mockApiFunction).toHaveBeenCalled();
    });

    test('should handle errors with custom onError handler', async () => {
      const onError = jest.fn();
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
      expect(console.error).toHaveBeenCalledWith('Controller error:', expect.any(Error));
    });
  });

  describe('createPostController', () => {
    test('should create a POST controller function', () => {
      const controller = createPostController(mockApiFunction);
      expect(typeof controller).toBe('function');
    });

    test('should call API function with body params', async () => {
      mockCtx.request.body = { name: 'test', value: '123' };
      mockApiFunction.mockResolvedValue({ status: 200, body: {} });

      const controller = createPostController(mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(mockApiFunction).toHaveBeenCalledWith({
        method: 'post',
        params: { name: 'test', value: '123' },
        option: {}
      });
    });

    test('should handle empty body', async () => {
      mockCtx.request.body = null;
      mockApiFunction.mockResolvedValue({ status: 200, body: {} });

      const controller = createPostController(mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(mockApiFunction).toHaveBeenCalledWith({
        method: 'post',
        params: {},
        option: {}
      });
    });

    test('should use validator for POST controller', async () => {
      const validator = jest.fn().mockReturnValue({ valid: false, error: 'Invalid POST' });
      const controller = createPostController(mockApiFunction, { validator });

      await controller(mockCtx, mockNext);

      expect(mockCtx.status).toBe(400);
      expect(mockCtx.body).toEqual({ response: 'Invalid POST' });
      expect(mockApiFunction).not.toHaveBeenCalled();
    });

    test('should handle errors in POST controller', async () => {
      mockApiFunction.mockRejectedValue(new Error('POST error'));

      const controller = createPostController(mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(mockCtx.status).toBe(500);
      expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
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

  describe('handleControllerResponse', () => {
    test('should set response from successful API call', async () => {
      const apiCall = jest.fn().mockResolvedValue({ status: 200, body: { data: 'success' } });

      await handleControllerResponse(mockCtx, apiCall);

      expect(mockCtx.status).toBe(200);
      expect(mockCtx.body).toEqual({ data: 'success' });
    });

    test('should handle API errors', async () => {
      const apiCall = jest.fn().mockRejectedValue(new Error('API error'));

      await handleControllerResponse(mockCtx, apiCall);

      expect(mockCtx.status).toBe(500);
      expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
      expect(console.error).toHaveBeenCalledWith('Controller response error:', expect.any(String));
    });

    test('should handle non-Error exceptions', async () => {
      const apiCall = jest.fn().mockRejectedValue('String error');

      await handleControllerResponse(mockCtx, apiCall);

      expect(mockCtx.status).toBe(500);
      expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
    });
  });

  describe('createCustomController', () => {
    test('should create a custom controller', () => {
      const handler = jest.fn().mockReturnValue({ id: '123' });
      const controller = createCustomController(handler, mockApiFunction);

      expect(typeof controller).toBe('function');
    });

    test('should call handler to get custom params', async () => {
      const handler = jest.fn().mockReturnValue({ id: '123', name: 'custom' });
      mockApiFunction.mockResolvedValue({ status: 200, body: {} });

      const controller = createCustomController(handler, mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(handler).toHaveBeenCalledWith(mockCtx);
      expect(mockApiFunction).toHaveBeenCalledWith({
        method: 'get',
        option: {},
        id: '123',
        name: 'custom'
      });
    });

    test('should handle errors in custom controller', async () => {
      const handler = jest.fn().mockReturnValue({});
      mockApiFunction.mockRejectedValue(new Error('Custom error'));

      const controller = createCustomController(handler, mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(mockCtx.status).toBe(500);
      expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
      expect(console.error).toHaveBeenCalledWith('Custom controller error:', expect.any(String));
    });

    test('should handle handler throwing error', async () => {
      const handler = jest.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });

      const controller = createCustomController(handler, mockApiFunction);
      await controller(mockCtx, mockNext);

      expect(mockCtx.status).toBe(500);
      expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
    });
  });
});
