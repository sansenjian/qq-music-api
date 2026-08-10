const { initExplorerAppMock } = vi.hoisted(() => ({ initExplorerAppMock: vi.fn() }));

vi.mock('../../../src/explorer/explorerApp', () => ({
	getDeepLinkParams: vi.fn(),
	initExplorerApp: initExplorerAppMock,
}));

import { startExplorerApp } from '../../../src/explorer/explorerBootstrap';

describe('explorer/explorerBootstrap', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
		initExplorerAppMock.mockReset();
	});

	test('does nothing when document is unavailable', () => {
		expect(() => startExplorerApp()).not.toThrow();
		expect(initExplorerAppMock).not.toHaveBeenCalled();
	});

	test.each([
		{ requestForm: null, metadataScript: { dataset: { metadataPath: '/explorer/metadata' } } },
		{ requestForm: {}, metadataScript: null },
	])('does nothing when required bootstrap elements are missing', ({ requestForm, metadataScript }) => {
		vi.stubGlobal('document', {
			getElementById: vi.fn().mockReturnValue(requestForm),
			querySelector: vi.fn().mockReturnValue(metadataScript),
		});

		startExplorerApp();

		expect(initExplorerAppMock).not.toHaveBeenCalled();
	});

	test('starts with the configured metadata path when required elements exist', () => {
		vi.stubGlobal('document', {
			getElementById: vi.fn().mockReturnValue({}),
			querySelector: vi.fn().mockReturnValue({ dataset: { metadataPath: '/explorer/metadata' } }),
		});

		startExplorerApp();

		expect(initExplorerAppMock).toHaveBeenCalledWith({ metadataPath: '/explorer/metadata' });
	});
});
