import request from 'supertest';
import app from '../../src/koaApp';

describe('API Explorer', () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	test('redirects /explorer to the static explorer page', async () => {
		const response = await request(app.callback()).get('/explorer').expect(302);

		expect(response.headers.location).toBe('/explorer/index.html');
	});

	test('returns explorer metadata from the registered API metadata', async () => {
		const response = await request(app.callback()).get('/explorer/metadata').expect(200);

		expect(response.type).toBe('application/json');
		expect(response.body).toMatchObject({
			title: 'QQ Music API Explorer',
			description: expect.any(String),
		});
		expect(response.body.endpoints).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'getSearchByKey',
					path: '/getSearchByKey',
					method: 'GET',
				}),
				expect.objectContaining({
					name: 'batchGetSongInfo',
					path: '/batchGetSongInfo',
					method: 'POST',
				}),
			]),
		);
	});

	test('serves explorer static assets', async () => {
		const html = await request(app.callback()).get('/explorer/index.html').expect(200);
		expect(html.type).toBe('text/html');
		expect(html.text).toContain('/explorer/app.js');
		expect(html.text).toContain('/explorer/styles.css');

		const script = await request(app.callback()).get('/explorer/app.js').expect(200);
		expect(script.type).toBe('application/javascript');
		expect(script.text).toContain("fetch('/explorer/metadata')");
	});

	test('does not handle non-GET explorer metadata requests', async () => {
		await request(app.callback()).post('/explorer/metadata').send({}).expect(404);
	});
});
