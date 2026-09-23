import type { Mock } from 'vitest';
import getSingerHotSongController from '../../../src/controllers/getSingerHotsong';
import { getSingerHotsong } from '../../../src/services';

vi.mock('../../../src/services');

describe('controllers/getSingerHotsong', () => {
	let mockCtx: any;
	let mockNext: Mock;
	let consoleErrorSpy: any;

	beforeEach(() => {
		mockCtx = {
			status: 200,
			body: null,
			query: {},
		};
		mockNext = vi.fn();
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
		vi.clearAllMocks();
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
	});

	test('should return 400 when singermid is missing', async () => {
		mockCtx.query = {};

		await getSingerHotSongController(mockCtx, mockNext);

		expect(mockCtx.status).toBe(400);
		expect(mockCtx.body).toEqual({ response: 'no singermid' });
		expect(getSingerHotsong).not.toHaveBeenCalled();
	});

	test('should return 400 when singermid is empty', async () => {
		mockCtx.query = { singermid: '' };

		await getSingerHotSongController(mockCtx, mockNext);

		expect(mockCtx.status).toBe(400);
		expect(getSingerHotsong).not.toHaveBeenCalled();
	});

	test('should call getSingerHotsong with parsed singermid', async () => {
		mockCtx.query = { singermid: 'test123' };
		(getSingerHotsong as Mock).mockResolvedValue({});

		await getSingerHotSongController(mockCtx, mockNext);

		expect(getSingerHotsong).toHaveBeenCalledWith({
			singermid: 'test123',
			num: 5,
			page: 0,
		});
	});

	test('should use custom limit and page values', async () => {
		mockCtx.query = { singermid: 'test123', limit: '10', page: '3' };
		(getSingerHotsong as Mock).mockResolvedValue({});

		await getSingerHotSongController(mockCtx, mockNext);

		expect(getSingerHotsong).toHaveBeenCalledWith({
			singermid: 'test123',
			num: 10,
			page: 3,
		});
	});

	test('should set response on successful API call', async () => {
		mockCtx.query = { singermid: 'test123' };
		const mockResponse = { code: 0, data: { songs: [] } };
		(getSingerHotsong as Mock).mockResolvedValue(mockResponse);

		await getSingerHotSongController(mockCtx, mockNext);

		expect(mockCtx.status).toBe(200);
		expect(mockCtx.body).toEqual({ response: mockResponse });
	});

	test('should handle API errors gracefully', async () => {
		mockCtx.query = { singermid: 'test123' };
		(getSingerHotsong as Mock).mockRejectedValue(new Error('API error'));

		await getSingerHotSongController(mockCtx, mockNext);

		expect(consoleErrorSpy).not.toHaveBeenCalled();
		expect(mockCtx.status).toBe(502);
		expect(mockCtx.body).toEqual({ error: '上游服务异常' });
	});
});
