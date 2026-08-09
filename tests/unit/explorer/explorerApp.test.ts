import { getDeepLinkParams, initExplorerApp } from '../../../src/explorer/explorerApp';

describe('explorer/explorerApp', () => {
	test('can be imported without starting the browser app', () => {
		expect(initExplorerApp).toEqual(expect.any(Function));
		expect(getDeepLinkParams).toEqual(expect.any(Function));
	});
});
