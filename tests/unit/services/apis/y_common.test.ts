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

	test('uses the u.y.qq.com gateway before the i.y.qq.com mirror when gateway is configured', async () => {
		const networkError = Object.assign(new Error('network unavailable'), { code: 'ERR_NETWORK' });
		const gatewayUpstream = {
			data: { code: 0, req_0: { code: 0, data: { body: { song: { list: [{ id: 1 }] } } } } },
		};
		requestMock
			.mockRejectedValueOnce(networkError)
			.mockRejectedValueOnce(networkError)
			.mockResolvedValueOnce(gatewayUpstream);

		const result = await yCommon({
			url: '/soso/fcgi-bin/client_search_cp',
			options: { params: { w: '周杰伦', n: 10, p: 1 } },
			gateway: {
				module: 'music.search.SearchCgiService',
				method: 'DoSearchForQQMusicDesktop',
				buildParam: p => ({ query: String(p.w), num_per_page: Number(p.n), page_num: Number(p.p) }),
				normalize: upstream => ({ code: Number(upstream.req_0.code), data: { ...upstream.req_0.data.body } }),
			},
		});

		expect(requestMock).toHaveBeenCalledTimes(3);
		const gatewayCall = requestMock.mock.calls[2][0];
		expect(gatewayCall.isUUrl).toBe('u');
		expect(gatewayCall.method).toBe('POST');
		expect(gatewayCall.url).toBe('https://u.y.qq.com/cgi-bin/musicu.fcg');
		const body = JSON.parse(gatewayCall.options.data);
		expect(body.req_0.module).toBe('music.search.SearchCgiService');
		expect(body.req_0.method).toBe('DoSearchForQQMusicDesktop');
		expect(body.req_0.param.query).toBe('周杰伦');
		expect(body.req_0.param.num_per_page).toBe(10);
		expect(result.data).toMatchObject({ code: 0, data: { song: { list: [{ id: 1 }] } } });
	});

	test('continues to the i.y.qq.com mirror when the u.y.qq.com gateway returns a non-zero code', async () => {
		const networkError = Object.assign(new Error('network unavailable'), { code: 'ERR_NETWORK' });
		const gatewayFailure = { data: { code: 0, req_0: { code: 500003, data: {} } } };
		const mirrorResponse = { data: { code: 0 } };
		requestMock
			.mockRejectedValueOnce(networkError)
			.mockRejectedValueOnce(networkError)
			.mockResolvedValueOnce(gatewayFailure)
			.mockResolvedValueOnce(mirrorResponse);

		await expect(
			yCommon({
				url: '/test',
				gateway: {
					module: 'music.m',
					method: 'Get',
					buildParam: () => ({}),
					normalize: upstream => upstream,
				},
			}),
		).resolves.toBe(mirrorResponse);
		expect(requestMock).toHaveBeenCalledTimes(4);
		expect(requestMock.mock.calls[3][0].isUUrl).toBe('i');
	});

	test('continues to the i.y.qq.com mirror when the gateway returns empty business data', async () => {
		const networkError = Object.assign(new Error('network unavailable'), { code: 'ERR_NETWORK' });
		const emptyGateway = { data: { code: 0, req_0: { code: 0, data: { body: { song: { list: [] } } } } } };
		const mirrorResponse = { data: { code: 0 } };
		requestMock
			.mockRejectedValueOnce(networkError)
			.mockRejectedValueOnce(networkError)
			.mockResolvedValueOnce(emptyGateway)
			.mockResolvedValueOnce(mirrorResponse);

		await expect(
			yCommon({
				url: '/test',
				gateway: {
					module: 'music.search.SearchCgiService',
					method: 'DoSearchForQQMusicDesktop',
					buildParam: () => ({}),
					normalize: upstream => {
						const code = Number(upstream.req_0.code);
						const body = upstream.req_0.data.body;
						if (code === 0 && (!Array.isArray(body.song.list) || body.song.list.length === 0)) {
							throw Object.assign(new Error('empty'), { code: 'ERR_GATEWAY' });
						}
						return { code, data: body };
					},
				},
			}),
		).resolves.toBe(mirrorResponse);
		expect(requestMock).toHaveBeenCalledTimes(4);
		expect(requestMock.mock.calls[3][0].isUUrl).toBe('i');
	});
});
