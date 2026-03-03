const request = require('../../../util/request');

jest.mock('axios', () => {
	const mockAxios = {
		GET: jest.fn(),
		POST: jest.fn(),
		get: jest.fn(),
		post: jest.fn(),
		defaults: {
			withCredentials: true,
			timeout: 10000,
			headers: {
				post: {},
			},
			responseType: 'json',
		},
	};
	return mockAxios;
});

const axios = require('axios');

describe('request util', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		global.userInfo = { cookie: 'test_cookie=123' };
	});

	afterEach(() => {
		delete global.userInfo;
	});

	test('should make GET request', async () => {
		const mockData = { code: 0, data: {} };
		axios.GET.mockResolvedValue({ data: mockData });

		const result = await request('/api/test', 'GET');

		expect(axios.GET).toHaveBeenCalled();
	});

	test('should handle request error', async () => {
		const error = new Error('Network Error');
		axios.GET.mockRejectedValue(error);

		await expect(request('/api/test', 'GET')).rejects.toThrow();
	});

	test('should set correct headers', async () => {
		axios.GET.mockResolvedValue({ data: {} });

		await request('/api/test', 'GET', { headers: { 'Custom-Header': 'value' } });

		const call = axios.GET.mock.calls[0][1];
		expect(call.headers).toBeDefined();
		expect(call.headers.cookies).toBe('test_cookie=123');
	});

	test('should handle timeout', async () => {
		const error = new Error('Timeout');
		error.code = 'ECONNABORTED';
		axios.GET.mockRejectedValue(error);

		await expect(request('/api/test', 'GET', { timeout: 5000 })).rejects.toThrow();
	});
});
