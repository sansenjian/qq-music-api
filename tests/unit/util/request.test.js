jest.mock('axios', () => {
	const service = jest.fn(() => Promise.resolve({ data: {}, config: { url: 'test' } }));
	service.interceptors = {
		request: { use: jest.fn() },
		response: { use: jest.fn() },
	};
	return {
		create: jest.fn(() => service),
		defaults: { headers: { post: {} } },
	};
});

const axios = require('axios');
const request = require('../../../util/request');

describe('request util', () => {
	let mockService;

	beforeEach(() => {
		jest.clearAllMocks();
		// Get the service instance that was returned by axios.create
		mockService = axios.create();
		mockService.mockResolvedValue({ data: {}, config: { url: 'test' } });
		global.userInfo = { cookie: 'test_cookie=123' };
	});

	afterEach(() => {
		delete global.userInfo;
	});

	test('should make GET request', async () => {
		await request('/api/test', 'GET');
		expect(mockService).toHaveBeenCalledWith(
			expect.objectContaining({
				url: expect.stringContaining('/api/test'),
				method: 'get',
			})
		);
	});

	test('should handle request error', async () => {
		const error = new Error('Network Error');
		mockService.mockRejectedValue(error);

		await expect(request('/api/test', 'GET')).rejects.toThrow();
	});

	test('should set correct headers', async () => {
		await request('/api/test', 'GET', { headers: { 'Custom-Header': 'value' } });

		const call = mockService.mock.calls[0][0];
		expect(call.headers).toBeDefined();
		expect(call.headers.Cookie).toBe('test_cookie=123');
		expect(call.headers['Custom-Header']).toBe('value');
	});
});
