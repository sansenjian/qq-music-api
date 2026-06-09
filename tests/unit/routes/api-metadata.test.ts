import { apiMetadata, apiMetadataPaths } from '../../../src/routes/api-metadata';
import context from '../../../src/controllers';
import router from '../../../src/routes/router';

const IGNORED_ROUTER_METHODS = new Set(['HEAD', 'OPTIONS']);

const getRoutePaths = () => {
	const stack = (router as unknown as { stack: Array<{ path: string }> }).stack;
	return new Set(stack.map(layer => layer.path));
};

const getRouteEntries = () => {
	const stack = (router as unknown as { stack: Array<{ path: string; methods: string[] }> }).stack;

	return stack.flatMap(layer =>
		layer.methods
			.filter(method => !IGNORED_ROUTER_METHODS.has(method))
			.map(method => `${method} ${layer.path}`),
	);
};

const getMetadataEntries = () =>
	apiMetadata.flatMap(item => [item.path, ...(item.aliases || [])].map(path => `${item.method} ${path}`));

const getMetadataItem = (name: string) => {
	const item = apiMetadata.find(entry => entry.name === name);
	if (!item) throw new Error(`Missing metadata item: ${name}`);
	return item;
};

const getQueryParamNames = (name: string) => new Set((getMetadataItem(name).queryParams || []).map(param => param.name));

describe('routes/api-metadata', () => {
	test('should keep metadata paths in sync with registered routes', () => {
		const routePaths = getRoutePaths();

		for (const metadataPath of apiMetadataPaths) {
			expect(routePaths.has(metadataPath)).toBe(true);
		}
	});

	test('should document every registered route in metadata', () => {
		const metadataEntries = new Set(getMetadataEntries());
		const undocumentedRoutes = getRouteEntries().filter(routeEntry => !metadataEntries.has(routeEntry));

		expect(undocumentedRoutes).toEqual([]);
	});

	test('should register exactly the method and path entries declared in metadata', () => {
		expect(new Set(getRouteEntries())).toEqual(new Set(getMetadataEntries()));
	});

	test('should reference existing controllers', () => {
		const controllerNames = new Set(Object.keys(context));
		const missingControllers = apiMetadata
			.filter(item => !controllerNames.has(item.name))
			.map(item => item.name);

		expect(missingControllers).toEqual([]);
	});

	test('should avoid duplicate method and path entries across paths and aliases', () => {
		const keys = getMetadataEntries();
		expect(new Set(keys).size).toBe(keys.length);
	});

	test('should document controller query params for metadata-sensitive APIs', () => {
		expect(getQueryParamNames('getUserPlaylists')).toEqual(new Set(['uin', 'offset', 'limit', 'cookie']));
		expect(getQueryParamNames('getUserLikedSongs')).toEqual(new Set(['uin', 'offset', 'limit', 'cookie']));
		expect(getQueryParamNames('getImageUrl')).toEqual(new Set(['id', 'size', 'maxAge']));
		expect(getQueryParamNames('getSearchByKey')).toEqual(
			new Set(['key', 'limit', 'page', 'catZhida', 'remoteplace']),
		);
		expect(getQueryParamNames('getSongListDetail')).toEqual(new Set(['disstid']));
		expect(getQueryParamNames('getAlbumSongs')).toEqual(
			new Set(['albummid', 'albumid', 'begin', 'limit', 'order']),
		);
		expect(getQueryParamNames('getRelatedPlaylists')).toEqual(
			new Set(['songid', 'sin', 'lastId', 'songType']),
		);
		expect(getQueryParamNames('getRelatedMv')).toEqual(
			new Set(['songid', 'songtype', 'lastmvid', 'limit']),
		);
	});

	test('should mark login-dependent API metadata as cookie required', () => {
		expect(getMetadataItem('getUserPlaylists').cookieRequired).toBe(true);
		expect(getMetadataItem('getUserLikedSongs').cookieRequired).toBe(true);
		expect(getMetadataItem('getUserCollectedSongLists').cookieRequired).toBe(true);
		expect(getMetadataItem('getUserCollectedAlbums').cookieRequired).toBe(true);
		expect(getMetadataItem('getUserFollowSingers').cookieRequired).toBe(true);
		expect(getMetadataItem('getUserFollowUsers').cookieRequired).toBe(true);
		expect(getMetadataItem('getUserFans').cookieRequired).toBe(true);
		expect(getMetadataItem('getMusicPlay').cookieRequired).toBe(true);
		expect(getMetadataItem('getLyric').cookieRequired).toBe(true);
	});
});
