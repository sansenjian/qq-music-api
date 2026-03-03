const cors = require('../../../middlewares/koa-cors');

describe('CORS Middleware', () => {
  test('should set CORS headers', async () => {
    const ctx = {
      method: 'GET',
      set: jest.fn(),
      get: jest.fn().mockReturnValue('http://localhost:3000'),
      vary: jest.fn(),
      status: 200,
      body: {}
    };
    const next = jest.fn().mockResolvedValue(undefined);

    await cors()(ctx, next);

    expect(ctx.set).toHaveBeenCalled();
    expect(ctx.vary).toHaveBeenCalledWith('Origin');
    expect(next).toHaveBeenCalled();
  });

  test('should handle preflight request', async () => {
    const ctx = {
      method: 'OPTIONS',
      set: jest.fn(),
      get: jest.fn().mockReturnValue('GET'),
      vary: jest.fn(),
      status: 200
    };
    const next = jest.fn().mockResolvedValue(undefined);

    await cors()(ctx, next);

    expect(ctx.status).toBe(204);
    expect(ctx.set).toHaveBeenCalledWith('Access-Control-Allow-Methods', expect.any(String));
  });
});
