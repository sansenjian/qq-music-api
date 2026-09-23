import type { Mock } from 'vitest';
import getHotkeyController from '../../../src/controllers/getHotKey';
import { getHotKey } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getHotKey', () => {
  let mockCtx: any;
  let mockNext: Mock;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null
    };
    mockNext = vi.fn();
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('should call getHotKey with correct props', async () => {
    (getHotKey as Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getHotkeyController(mockCtx, mockNext);

    expect(getHotKey).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign status and body to ctx', async () => {
    const mockResponse = { status: 200, body: { code: 0, data: { hotkeys: [] } } };
    (getHotKey as Mock).mockResolvedValue(mockResponse);

    await getHotkeyController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { hotkeys: [] } });
  });

  test('should handle errors from getHotKey', async () => {
    const mockError = new Error('API error');
    (getHotKey as Mock).mockRejectedValue(mockError);

    await getHotkeyController(mockCtx, mockNext);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(mockCtx.status).toBe(500);
    expect(mockCtx.body).toEqual({ error: '服务器内部错误' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
