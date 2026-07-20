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
});
