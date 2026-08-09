import request from 'supertest';
import app from '../../src/koaApp';
import { API_EXPLORER_METADATA_PATH } from '../../src/middlewares/api-explorer';

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

	test('preserves query params when redirecting explorer deep links', async () => {
		const response = await request(app.callback()).get('/explorer?api=getImageUrl&id=abc').expect(302);

		expect(response.headers.location).toBe('/explorer/index.html?api=getImageUrl&id=abc');
	});

	test('returns explorer metadata from the registered API metadata', async () => {
		const response = await request(app.callback()).get(API_EXPLORER_METADATA_PATH).expect(200);

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
					description: expect.any(String),
					queryParams: expect.arrayContaining([
						expect.objectContaining({
							name: 'limit',
							defaultValue: 10,
							description: expect.any(String),
						}),
						expect.objectContaining({
							name: 'remoteplace',
							enumValues: expect.arrayContaining(['song', 'album']),
						}),
					]),
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
		expect(html.text).toContain(`href="${API_EXPLORER_METADATA_PATH}"`);
		expect(html.text).toContain(`data-metadata-path="${API_EXPLORER_METADATA_PATH}"`);

		const script = await request(app.callback()).get('/explorer/app.js').expect(200);
		expect(script.type).toBe('application/javascript');
		expect(script.text).toContain('fetch(metadataPath)');
		expect(script.text).toContain('findDeepLinkedEndpoint');
		expect(script.text).toContain('applyDeepLinkParams');
		expect(script.text).toContain('param.defaultValue');
		expect(script.text).toContain('param.enumValues');
		expect(script.text).toContain('field-help');
		expect(script.text).toContain('requestSubmit()');
		expect(script.text).toContain('DOMContentLoaded');
	});

	test('does not handle non-GET explorer metadata requests', async () => {
		await request(app.callback()).post(API_EXPLORER_METADATA_PATH).send({}).expect(404);
	});
});
