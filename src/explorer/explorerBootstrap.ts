/// <reference lib="dom" />

import { getDeepLinkParams, initExplorerApp } from './explorerApp';

export { getDeepLinkParams, initExplorerApp };

export const startExplorerApp = (): void => {
	if (typeof document === 'undefined') return;

	const requestForm = document.getElementById('request-form');
	const metadataPath = document.querySelector<HTMLScriptElement>('script[data-metadata-path]')?.dataset.metadataPath;
	if (!requestForm || !metadataPath) return;

	initExplorerApp({ metadataPath });
};

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', startExplorerApp, { once: true });
	} else {
		startExplorerApp();
	}
}
