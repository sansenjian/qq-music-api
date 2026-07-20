import request from 'supertest';
import Koa from 'koa';
import {
	createTestApp,
	createTestUserInfo,
	getLatestRequestCookie,
	getLatestRequestOptions,
	getLatestRequestPayload,
} from '../../../tests/setup/testUtils';

const { mockFn } = vi.hoisted(() => {
	const mockFn = Object.assign(vi.fn().mockResolvedValue({ data: { code: 0, data: {} } }), {
		interceptors: {
			request: { use: vi.fn() },
			response: { use: vi.fn() },
		},
	});
	return { mockFn };
});

vi.mock('axios', () => ({
	default: {
		get: mockFn,
		post: mockFn,
		create: vi.fn(() => mockFn),
	},
	get: mockFn,
	post: mockFn,
	create: vi.fn(() => mockFn),
	defaults: {
		withCredentials: true,
		timeout: 10000,
		headers: { post: {} },
		responseType: 'json',
	},
}));

const getLatestMusicuPayload = () => {
	const options = getLatestRequestOptions(mockFn) as {
		data?: string;
		params?: { data?: string };
	};
	const data = options.data || options.params?.data;
	return data ? JSON.parse(data) : null;
};

describe('readonly jsososo parity APIs', () => {
	let app: Koa;
	let callback: any;

	beforeAll(() => {
		app = createTestApp();
		callback = (app as any).callback();
	});

	beforeEach(() => {
		vi.clearAllMocks();
		mockFn.mockReset();
		mockFn.mockResolvedValue({ data: { code: 0, data: {} } });
		global.userInfo = createTestUserInfo();
	});

	test('GET /getAlbumSongs builds album song list payload', async () => {
		await request(callback)
			.get('/getAlbumSongs')
			.query({ albummid: '002MAeob3zLXwZ', begin: '10', limit: '30' })
			.expect(200);

		const payload = getLatestRequestPayload(mockFn);
		expect(payload.albumSonglist).toMatchObject({
			module: 'music.musichallAlbum.AlbumSongList',
			method: 'GetAlbumSongList',
			param: {
				albumMid: '002MAeob3zLXwZ',
				begin: 10,
				num: 30,
			},
		});
	});

	test('GET /getAlbumSongs supports path albummid and rejects missing values', async () => {
		await request(callback).get('/getAlbumSongs/002MAeob3zLXwZ').expect(200);
		expect(getLatestRequestPayload(mockFn).albumSonglist.param.albumMid).toBe('002MAeob3zLXwZ');

		mockFn.mockClear();
		const response = await request(callback).get('/getAlbumSongs').expect(400);
		expect(response.body.response).toBe('no albummid');
		expect(mockFn).not.toHaveBeenCalled();
	});

	test('GET /getMvCategory and /getSingerCategory expose category RPC calls', async () => {
		await request(callback).get('/getMvCategory').expect(200);
		expect(getLatestMusicuPayload().mv_tag).toMatchObject({
			module: 'MvService.MvInfoProServer',
			method: 'GetAllocTag',
		});

		await request(callback).get('/getSingerCategory').expect(200);
		expect(getLatestMusicuPayload().singerList).toMatchObject({
			module: 'Music.SingerListServer',
			method: 'get_singer_list',
			param: {
				area: -100,
				sex: -100,
				genre: -100,
				index: -100,
			},
		});
	});

	test('GET /getRelatedPlaylists builds related playlist payload', async () => {
		await request(callback)
			.get('/getRelatedPlaylists')
			.query({ songid: '5105986', sin: '5', lastId: '12' })
			.expect(200);

		expect(getLatestRequestPayload(mockFn).gedan).toMatchObject({
			module: 'music.mb_gedan_recommend_svr',
			method: 'get_related_gedan',
			param: {
				song_id: 5105986,
				sin: 5,
				last_id: 12,
			},
		});
	});

	test('GET /getRelatedMv builds related MV payload', async () => {
		await request(callback).get('/getRelatedMv').query({ songid: '5105986', limit: '8' }).expect(200);

		expect(getLatestRequestPayload(mockFn).video).toMatchObject({
			module: 'MvService.MvInfoProServer',
			method: 'GetSongRelatedMv',
			param: {
				songid: '5105986',
				num: 8,
			},
		});
	});

	test.each([
		['/getRelatedPlaylists', 'no songid'],
		['/getRelatedMv', 'no songid'],
	])('%s rejects missing songid', async (path, message) => {
		const response = await request(callback).get(path).expect(400);
		expect(response.body.response).toBe(message);
	});

	test('GET /getRecommendBanner builds focus payload', async () => {
		await request(callback).get('/getRecommendBanner').expect(200);

		expect(getLatestMusicuPayload().focus).toMatchObject({
			module: 'QQMusic.MusichallServer',
			method: 'GetFocus',
		});
	});

	test.each([
		['/user/getUserDetail', '/rsc/fcgi-bin/fcg_get_profile_homepage.fcg', { userid: 123456789 }],
		['/user/getUserCollectedSongLists', '/fav/fcgi-bin/fcg_get_profile_order_asset.fcg', { reqtype: 3 }],
		['/user/getUserCollectedAlbums', '/fav/fcgi-bin/fcg_get_profile_order_asset.fcg', { reqtype: 2 }],
		['/user/getUserFollowSingers', '/rsc/fcgi-bin/fcg_order_singer_getlist.fcg', { perpage: 5 }],
		['/user/getUserFollowUsers', '/rsc/fcgi-bin/friend_follow_or_listen_list.fcg', { num: 5 }],
		['/user/getUserFans', '/rsc/fcgi-bin/friend_follow_or_listen_list.fcg', { num: 5, is_listen: 1 }],
	])('%s builds user readonly request and forwards cookie', async (path, expectedUrl, expectedParams) => {
		await request(callback)
			.get(path)
			.query({ uin: '123456789', page: '2', limit: '5', cookie: 'uin=o123456789; qqmusic_key=mock' })
			.expect(200);

		const options = getLatestRequestOptions(mockFn) as {
			url?: string;
			params?: Record<string, unknown>;
		};
		expect(options.url).toContain(expectedUrl);
		expect(options.params).toMatchObject(expectedParams);
		expect(getLatestRequestCookie(mockFn)).toBe('uin=o123456789; qqmusic_key=mock');
	});

	test('user readonly APIs normalize pagination and avoid NaN values', async () => {
		await request(callback)
			.get('/user/getUserCollectedSongLists?uin=123456789&uin=987654321&page=abc&limit=bad')
			.expect(200);

		const options = getLatestRequestOptions(mockFn) as {
			params?: Record<string, unknown>;
		};
		expect(options.params).toMatchObject({
			userid: '123456789',
			sin: 0,
			ein: 20,
		});
	});

	test('user readonly APIs reject missing uin', async () => {
		const response = await request(callback).get('/user/getUserCollectedAlbums').expect(400);

		expect(response.body.error).toBe('缺少 uin 参数');
		expect(mockFn).not.toHaveBeenCalled();
	});

	test('GET /user/getVipInfo includes the authenticated uin and key material', async () => {
		await request(callback)
			.get('/user/getVipInfo')
			.query({ cookie: 'uin=o123456; qqmusic_key=mock-key; p_skey=pskey' })
			.expect(200);

		const payload = getLatestMusicuPayload();
		expect(payload.comm).toMatchObject({
			uin: 'o123456',
			loginUin: 'o123456',
			authst: 'mock-key',
		});
		expect(payload.comm.g_tk).toEqual(expect.any(Number));
	});

	test('GET /user/getDislikeList uses the signed musics endpoint', async () => {
		await request(callback)
			.get('/user/getDislikeList')
			.query({ cookie: 'uin=o123456; qqmusic_key=mock-key; p_skey=pskey', cmd: '3', page: '2', lastid: '9' })
			.expect(200);

		const options = getLatestRequestOptions(mockFn) as {
			url?: string;
			params?: { sign?: string; _?: number };
		};
		const payload = getLatestMusicuPayload();
		expect(options.url).toBe('https://u.y.qq.com/cgi-bin/musics.fcg');
		expect(options.params?.sign).toMatch(/^zzc/);
		expect(options.params?._).toEqual(expect.any(Number));
		expect(payload.req_1.param).toMatchObject({ Cmd: 3, Page: 2, SongLastid: 9 });
	});

	test('GET /user/getMusicGene forwards an explicit encrypted uin', async () => {
		await request(callback)
			.get('/user/getMusicGene')
			.query({ cookie: 'uin=o123456; qqmusic_key=mock-key', euin: 'encrypted-uin' })
			.expect(200);

		expect(getLatestMusicuPayload().req_1.param).toEqual({ VisitAccount: 'encrypted-uin' });
	});

	test('euin-based user APIs reject requests without an encrypted uin', async () => {
		const response = await request(callback)
			.get('/user/getMusicGene')
			.query({ cookie: 'uin=o123456; qqmusic_key=mock-key' })
			.expect(400);

		expect(response.body.error).toContain('euin');
		expect(mockFn).not.toHaveBeenCalled();
	});

	test('GET /resolveSongListShareUrl preserves an unencoded embedded ampersand', async () => {
		await request(callback)
			.get('/resolveSongListShareUrl')
			.query({ url: 'https://i2.y.qq.com/n3/other/pages/details/playlist.html?appshare=android_qq&id=2029866739' })
			.expect(200);

		const options = getLatestRequestOptions(mockFn) as { params?: { disstid?: string } };
		expect(options.params?.disstid).toBe('2029866739');
	});
});
