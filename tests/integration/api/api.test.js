const request = require('supertest');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('../../../routers/router');
const cors = require('../../../middlewares/koa-cors');

jest.mock('axios', () => {
	const mockFn = jest.fn().mockResolvedValue({ data: { code: 0, data: {} } });
	return {
		get: mockFn,
		post: mockFn,
		GET: mockFn,
		POST: mockFn,
		defaults: {
			withCredentials: true,
			timeout: 10000,
			headers: { post: {} },
			responseType: 'json',
		},
	};
});

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

	beforeAll(() => {
		app = createTestApp();
		callback = app.callback();
	});

	beforeEach(() => {
		jest.clearAllMocks();
		axios.get.mockResolvedValue({ data: { code: 0, data: {} } });
		axios.post.mockResolvedValue({ data: { code: 0, data: {} } });
		global.userInfo = { cookie: 'test_cookie=123' };
	});

	describe('GET /getHotkey', () => {
		test('should return hot search keywords', async () => {
			const response = await request(callback).get('/getHotkey').expect(200);
			expect(response.body).toBeDefined();
		}, 10000);
	});

	describe('GET /getTopLists', () => {
		test('should return top lists', async () => {
			const response = await request(callback).get('/getTopLists').expect(200);
			expect(response.body).toBeDefined();
		}, 10000);
	});

	describe('GET /getSearchByKey', () => {
		test('should search with query param', async () => {
			const response = await request(callback)
				.get('/getSearchByKey')
				.query({ key: 'test' })
				.expect(200);
			expect(response.body).toBeDefined();
		}, 10000);

		test('should search with path param (backward compatibility)', async () => {
			const response = await request(callback).get('/getSearchByKey/test').expect(200);
			expect(response.body).toBeDefined();
		}, 10000);
	});

	describe('GET /getLyric', () => {
		test('should return lyric with query param', async () => {
			const response = await request(callback)
				.get('/getLyric')
				.query({ songmid: 'test123' })
				.expect(200);
			expect(response.body).toBeDefined();
		}, 10000);
	});

	describe('POST /batchGetSongInfo', () => {
		test('should batch get song info', async () => {
			const response = await request(callback)
				.post('/batchGetSongInfo')
				.send({ songmids: 'test1,test2' })
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
			const response = await request(callback).get('/getHotkey').expect(200);
			expect(response.headers['access-control-allow-origin']).toBeDefined();
		});
	});
});
