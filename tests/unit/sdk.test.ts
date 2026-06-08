import {
	checkLoginQr,
	getLoginQr,
	getPlayUrl,
	lyric,
	search,
} from '../../src/sdk';
import {
	checkQQLoginQr,
	getLyric,
	getMusicPlay,
	getQQLoginQr,
	getSearchByKey,
} from '../../src/services';

vi.mock('../../src/services', () => ({
	checkQQLoginQr: vi.fn(),
	getLyric: vi.fn(),
	getMusicPlay: vi.fn(),
	getQQLoginQr: vi.fn(),
	getSearchByKey: vi.fn(),
}));

describe('sdk', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('search maps simple SDK params to search service options', async () => {
		vi.mocked(getSearchByKey).mockResolvedValue({ status: 200, body: { response: {} } });

		await search({ key: '周杰伦', limit: 20, page: 2 });

		expect(getSearchByKey).toHaveBeenCalledWith({
			method: 'get',
			params: {
				w: '周杰伦',
				n: 20,
				p: 2,
				catZhida: 1,
				remoteplace: 'txt.yqq.song',
			},
			option: {},
		});
	});

	test('getPlayUrl maps cookie to service headers', async () => {
		vi.mocked(getMusicPlay).mockResolvedValue({ status: 200, body: { data: {} } });

		await getPlayUrl({
			songmid: '003rJSwm3TechU',
			quality: '320',
			cookie: 'uin=o123; qqmusic_key=secret',
		});

		expect(getMusicPlay).toHaveBeenCalledWith({
			method: 'get',
			params: {
				songmid: '003rJSwm3TechU',
				quality: '320',
				resType: 'play',
				mediaId: undefined,
			},
			option: {
				headers: {
					Cookie: 'uin=o123; qqmusic_key=secret',
				},
			},
		});
	});

	test('lyric maps format and cookie to lyric service options', async () => {
		vi.mocked(getLyric).mockResolvedValue({ status: 200, body: { response: {} } });

		await lyric({
			songmid: '003rJSwm3TechU',
			isFormat: true,
			cookie: 'uin=o123',
		});

		expect(getLyric).toHaveBeenCalledWith({
			method: 'get',
			params: {
				songmid: '003rJSwm3TechU',
				songid: undefined,
			},
			isFormat: true,
			option: {
				headers: {
					Cookie: 'uin=o123',
				},
			},
		});
	});

	test('login QR helpers call existing login services', async () => {
		vi.mocked(getQQLoginQr).mockResolvedValue({ status: 200, body: { response: {} } });
		vi.mocked(checkQQLoginQr).mockResolvedValue({ status: 200, body: { response: {} } });

		await getLoginQr();
		await checkLoginQr({ ptqrtoken: 123, qrsig: 'abc' });

		expect(getQQLoginQr).toHaveBeenCalledWith({});
		expect(checkQQLoginQr).toHaveBeenCalledWith({
			method: 'post',
			params: {
				ptqrtoken: 123,
				qrsig: 'abc',
			},
		});
	});
});
