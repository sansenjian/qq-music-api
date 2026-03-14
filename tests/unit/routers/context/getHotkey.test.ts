import getHotkeyController from '../../../../routers/context/getHotkey';
import { getHotKey } from '../../../../module';

jest.mock('../../../../module');

describe('routers/context/getHotkey', () => {
  let mockCtx: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockCtx = {
      status: 200,
      body: null
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  test('should call getHotKey with correct props', async () => {
    (getHotKey as jest.Mock).mockResolvedValue({ status: 200, body: { code: 0, data: {} } });

    await getHotkeyController(mockCtx, mockNext);

    expect(getHotKey).toHaveBeenCalledWith({
      method: 'get',
      params: {},
      option: {}
    });
  });

  test('should assign status and body to ctx', async () => {
    const mockResponse = { status: 200, body: { code: 0, data: { hotkeys: [] } } };
    (getHotKey as jest.Mock).mockResolvedValue(mockResponse);

    await getHotkeyController(mockCtx, mockNext);

    expect(mockCtx.status).toBe(200);
    expect(mockCtx.body).toEqual({ code: 0, data: { hotkeys: [] } });
  });

  test('should handle DEBUG mode logging', async () => {
    const originalDebug = process.env.DEBUG;
    process.env.DEBUG = 'true';
    
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    (getHotKey as jest.Mock).mockResolvedValue({ status: 200, body: {} });

    await getHotkeyController(mockCtx, mockNext);

    expect(consoleLogSpy).toHaveBeenCalledWith('[getHotkey] controller props:', expect.any(Object));
    expect(consoleLogSpy).toHaveBeenCalledWith('[getHotkey] controller response status:', 200);

    consoleLogSpy.mockRestore();
    process.env.DEBUG = originalDebug;
  });

  test('should skip logging when DEBUG is not true', async () => {
    const originalDebug = process.env.DEBUG;
    process.env.DEBUG = 'false';
    
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    (getHotKey as jest.Mock).mockResolvedValue({ status: 200, body: {} });

    await getHotkeyController(mockCtx, mockNext);

    expect(consoleLogSpy).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
    process.env.DEBUG = originalDebug;
  });

  test('should handle errors from getHotKey', async () => {
    const mockError = new Error('API error');
    (getHotKey as jest.Mock).mockRejectedValue(mockError);

    await expect(getHotkeyController(mockCtx, mockNext)).rejects.toThrow('API error');
  });
});
