import yCommon from '../../../../src/services/apis/y_common';

const { requestMock } = vi.hoisted(() => ({ requestMock: vi.fn() }));

vi.mock('../../../../src/util/request', () => ({ default: requestMock }));

describe('services/apis/y_common', () => {
	beforeEach(() => {
		requestMock.mockReset();
	});

	test('accepts an empty array response without retrying', async () => {
		const response = { data: [] };
		requestMock.mockResolvedValue(response);

		await expect(yCommon({ url: '/test' })).resolves.toBe(response);
		expect(requestMock).toHaveBeenCalledTimes(1);
	});

	test('retries Axios ERR_NETWORK failures with the fallback referer', async () => {
		const networkError = Object.assign(new Error('network unavailable'), { code: 'ERR_NETWORK' });
		const fallbackResponse = { data: { code: 0 } };
		requestMock.mockRejectedValueOnce(networkError).mockResolvedValueOnce(fallbackResponse);

		await expect(yCommon({ url: '/test' })).resolves.toBe(fallbackResponse);
		expect(requestMock).toHaveBeenCalledTimes(2);
		expect(requestMock.mock.calls[0][0].options.headers.referer).toBe('https://c.y.qq.com/');
		expect(requestMock.mock.calls[1][0].options.headers.referer).toBe('https://y.qq.com');
	});

	test.each(['{invalid', 'callback(invalid)'])('retries malformed JSON or JSONP response: %s', async malformed => {
		const fallbackResponse = { data: { code: 0 } };
		requestMock.mockResolvedValueOnce({ data: malformed }).mockResolvedValueOnce(fallbackResponse);

		await expect(yCommon({ url: '/test' })).resolves.toBe(fallbackResponse);
		expect(requestMock).toHaveBeenCalledTimes(2);
		expect(requestMock.mock.calls[1][0].options.headers.referer).toBe('https://y.qq.com');
	});

	test.each(['{}', 'callback({})'])('retries empty object JSON or JSONP response: %s', async emptyObject => {
		const fallbackResponse = { data: { code: 0 } };
		requestMock.mockResolvedValueOnce({ data: emptyObject }).mockResolvedValueOnce(fallbackResponse);

		await expect(yCommon({ url: '/test' })).resolves.toBe(fallbackResponse);
		expect(requestMock).toHaveBeenCalledTimes(2);
		expect(requestMock.mock.calls[1][0].options.headers.referer).toBe('https://y.qq.com');
	});

	test('falls back to the i.y.qq.com mirror after both c.y.qq.com attempts fail', async () => {
		const networkError = Object.assign(new Error('network unavailable'), { code: 'ERR_NETWORK' });
		const mirrorResponse = { data: { code: 0 } };
		requestMock
			.mockRejectedValueOnce(networkError)
			.mockRejectedValueOnce(networkError)
			.mockResolvedValueOnce(mirrorResponse);

		await expect(yCommon({ url: '/test' })).resolves.toBe(mirrorResponse);
		expect(requestMock).toHaveBeenCalledTimes(3);
		expect(requestMock.mock.calls[0][0].isUUrl).toBe('c');
		expect(requestMock.mock.calls[2][0].isUUrl).toBe('i');
		expect(requestMock.mock.calls[2][0].options.headers.host).toBe('i.y.qq.com');
	});

	test('falls back to i.y.qq.com when both c.y.qq.com attempts return malformed responses', async () => {
		const mirrorResponse = { data: { code: 0 } };
		requestMock
			.mockResolvedValueOnce({ data: '{invalid' })
			.mockResolvedValueOnce({ data: '{invalid' })
			.mockResolvedValueOnce(mirrorResponse);

		await expect(yCommon({ url: '/test' })).resolves.toBe(mirrorResponse);
		expect(requestMock).toHaveBeenCalledTimes(3);
		expect(requestMock.mock.calls[2][0].isUUrl).toBe('i');
	});

	test('throws the first retryable error after all three attempts fail', async () => {
		const networkError = Object.assign(new Error('network unavailable'), { code: 'ERR_NETWORK' });
		requestMock.mockRejectedValue(networkError);

		await expect(yCommon({ url: '/test' })).rejects.toBe(networkError);
		expect(requestMock).toHaveBeenCalledTimes(3);
	});

	test('rethrows non-retryable errors from the second attempt with the primary error first', async () => {
		const networkError = Object.assign(new Error('network unavailable'), { code: 'ERR_NETWORK' });
		const businessError = new Error('bad request');
		requestMock.mockRejectedValueOnce(networkError).mockRejectedValueOnce(businessError);

		await expect(yCommon({ url: '/test' })).rejects.toBe(networkError);
		expect(requestMock).toHaveBeenCalledTimes(2);
	});
});
