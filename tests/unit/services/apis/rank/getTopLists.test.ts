import getTopLists from '../../../../../src/services/apis/rank/getTopLists';

const { requestMock } = vi.hoisted(() => ({
	requestMock: vi.fn().mockResolvedValue({ data: { code: 0 } }),
}));

vi.mock('../../../../../src/util/request', () => ({ default: requestMock }));

describe('services/apis/rank/getTopLists', () => {
	beforeEach(() => {
		requestMock.mockClear();
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
			headers: { 'x-request-id': 'test' },
			timeout: 1000,
			params: {
				language: 'zh-CN',
				format: 'json',
				outCharset: 'utf-8',
				platform: 'h5',
				needNewCode: 1,
			},
		});
	});
});
