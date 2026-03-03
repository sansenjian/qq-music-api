const request = require('supertest');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('../../../routers/router');
const cors = require('../../../middlewares/koa-cors');

jest.mock('axios', () => ({
	get: jest.fn(),
	post: jest.fn(),
	defaults: {
		withCredentials: true,
		timeout: 10000,
		headers: { post: {} },
		responseType: 'json',
	},
}));

const axios = require('axios');

function createTestApp() {
	const app = new Koa();
	app.use(cors());
	app.use(bodyParser());
	app.use(router.routes());
	app.use(router.allowedMethods());
	return app;
}

describe('API Integration Tests', () => {
	let app;
	let callback;

	beforeEach(() => {
		jest.clearAllMocks();
		global.userInfo = { cookie: 'test_cookie=123' };
	});

	beforeAll(() => {
		app = createTestApp();
		callback = app.callback();
	});

	describe('GET /getHotkey', () => {
		test('should return hot search keywords', async () => {
			axios.get.mockResolvedValue({
				data: { code: 0, data: { hotkey: ['test1', 'test2'] } },
			});

			const response = await request(callback).get('/getHotkey').expect(200);

			expect(response.body).toBeDefined();
		}, 10000);
	});

	describe('GET /getTopLists', () => {
		test('should return top lists', async () => {
			axios.get.mockResolvedValue({
				data: { code: 0, data: { topList: [] } },
			});

			const response = await request(callback).get('/getTopLists').expect(200);

			expect(response.body).toBeDefined();
		}, 10000);
	});

	describe('GET /getSearchByKey', () => {
		test('should search with query param', async () => {
			axios.get.mockResolvedValue({
				data: { code: 0, data: { song: { list: [] } } },
			});

			const response = await request(callback)
				.get('/getSearchByKey')
				.query({ key: '周杰伦' })
				.expect(200);

			expect(response.body).toBeDefined();
		}, 10000);

		test('should search with path param (backward compatibility)', async () => {
			axios.get.mockResolvedValue({
				data: { code: 0, data: { song: { list: [] } } },
			});

			const response = await request(callback).get('/getSearchByKey/周杰伦').expect(200);

			expect(response.body).toBeDefined();
		}, 10000);
	});

	describe('GET /getLyric', () => {
		test('should return lyric with query param', async () => {
			axios.get.mockResolvedValue({
				data: { code: 0, lyric: '[00:01.00]Test' },
			});

			const response = await request(callback)
				.get('/getLyric')
				.query({ songmid: '001ABCdeFgHIJk' })
				.expect(200);

			expect(response.body).toBeDefined();
		}, 10000);
	});

	describe('POST /batchGetSongInfo', () => {
		test('should batch get song info', async () => {
			axios.get.mockResolvedValue({
				data: { code: 0, data: [] },
			});

			const response = await request(callback)
				.post('/batchGetSongInfo')
				.send({ songmids: '001ABCdeFgHIJk,002DEFghIJKLMn' })
				.expect(200);

			expect(response.body).toBeDefined();
		}, 10000);
	});

	describe('Error handling', () => {
		test('should return 404 for unknown route', async () => {
			await request(callback).get('/unknown-route').expect(404);
		});

		test('should return 400 for missing search key', async () => {
			const response = await request(callback).get('/getSearchByKey').expect(400);

			expect(response.body.response).toBe('search key is null');
		});
	});

	describe('CORS middleware', () => {
		test('should set CORS headers', async () => {
			axios.get.mockResolvedValue({
				data: { code: 0, data: { hotkey: [] } },
			});

			const response = await request(callback).get('/getHotkey').expect(200);

			expect(response.headers['access-control-allow-origin']).toBeDefined();
		});
	});
});
