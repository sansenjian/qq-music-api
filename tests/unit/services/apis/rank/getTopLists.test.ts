import getTopLists from '../../../../../src/services/apis/rank/getTopLists';

const { requestMock } = vi.hoisted(() => ({
	requestMock: vi.fn().mockResolvedValue({ data: { code: 0 } }),
}));

vi.mock('../../../../../src/util/request', () => ({ default: requestMock }));

describe('services/apis/rank/getTopLists', () => {
	beforeEach(() => {
		requestMock.mockReset();
		requestMock.mockResolvedValue({ data: { code: 0 } });
	});

	test('does not mutate caller-provided params or option objects', async () => {
		const params = { language: 'zh-CN' };
		const option = { headers: { 'x-request-id': 'test' }, timeout: 1000 };

		await getTopLists({ params, option });

		expect(params).toEqual({ language: 'zh-CN' });
		expect(option).toEqual({ headers: { 'x-request-id': 'test' }, timeout: 1000 });

		const requestConfig = requestMock.mock.calls[0][0];
		expect(requestConfig.options).not.toBe(option);
		expect(requestConfig.options.params).not.toBe(params);
		expect(requestConfig.options).toMatchObject({
			headers: { 'x-request-id': 'test', referer: 'https://c.y.qq.com/', host: 'c.y.qq.com' },
			timeout: 1000,
			params: {
				language: 'zh-CN',
				format: 'json',
				outCharset: 'utf-8',
				platform: 'h5',
				needNewCode: 1,
			},
		});
		expect(requestConfig.isUUrl).toBe('c');
	});

	test('falls back to the i.y.qq.com mirror when the c.y.qq.com attempts fail', async () => {
		const networkError = Object.assign(new Error('network unavailable'), { code: 'ERR_NETWORK' });
		requestMock.mockRejectedValueOnce(networkError).mockRejectedValueOnce(networkError);

		const response = { data: { code: 0 } };
		requestMock.mockResolvedValueOnce(response);

		await expect(getTopLists({})).resolves.toMatchObject({
			status: 200,
			body: { response: { code: 0 } },
		});
		expect(requestMock).toHaveBeenCalledTimes(3);
		expect(requestMock.mock.calls[0][0].isUUrl).toBe('c');
		expect(requestMock.mock.calls[2][0].isUUrl).toBe('i');
	});
});
