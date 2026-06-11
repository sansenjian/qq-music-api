import request from 'supertest';
import app from '../../src/koaApp';

describe('Home page', () => {
	let consoleLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
	});

	afterEach(() => {
		consoleLogSpy.mockRestore();
	});

	test('serves a lightweight entry page that links to the Explorer console', async () => {
		const response = await request(app.callback()).get('/index.html').expect(200);

		expect(response.type).toBe('text/html');
		expect(response.text).toContain('/explorer?api=getSearchByKey');
		expect(response.text).toContain('/explorer?api=getImageUrl');
		expect(response.text).toContain('/explorer/metadata');
		expect(response.text).not.toContain('request-builder');
		expect(response.text).not.toContain('playground-utils.js');
	});
});
