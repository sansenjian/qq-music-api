import type { Middleware } from 'koa';
import { apiMetadata } from '../routes/api-metadata';

export const API_EXPLORER_ROUTE_PATH = '/explorer';
export const API_EXPLORER_INDEX_PATH = '/explorer/index.html';
export const API_EXPLORER_METADATA_PATH = '/explorer/metadata';

const apiExplorer = (): Middleware => async (ctx, next) => {
	if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
		await next();
		return;
	}

	if (ctx.path === API_EXPLORER_ROUTE_PATH) {
		ctx.redirect(API_EXPLORER_INDEX_PATH);
		return;
	}

	if (ctx.path === API_EXPLORER_METADATA_PATH) {
		ctx.type = 'application/json';
		ctx.body = {
			title: 'QQ Music API Explorer',
			description: 'Local API request explorer powered by the server metadata.',
			endpoints: apiMetadata,
		};
		return;
	}

	await next();
};

export default apiExplorer;
