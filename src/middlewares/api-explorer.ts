import fs from 'node:fs/promises';
import path from 'node:path';
import type { Middleware } from 'koa';
import { apiMetadata } from '../routes/api-metadata';

export const API_EXPLORER_ROUTE_PATH = '/explorer';
export const API_EXPLORER_INDEX_PATH = '/explorer/index.html';
export const API_EXPLORER_METADATA_PATH = '/explorer/metadata';

interface ApiExplorerOptions {
	publicDir?: string;
}

const METADATA_PATH_PLACEHOLDER = '__API_EXPLORER_METADATA_PATH__';

const renderExplorerIndex = async (publicDir: string) => {
	const templatePath = path.join(publicDir, 'explorer', 'index.html');
	const template = await fs.readFile(templatePath, 'utf8');
	return template.split(METADATA_PATH_PLACEHOLDER).join(API_EXPLORER_METADATA_PATH);
};

const apiExplorer =
	(options: ApiExplorerOptions = {}): Middleware =>
	async (ctx, next) => {
		if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
			await next();
			return;
		}

		if (ctx.path === API_EXPLORER_ROUTE_PATH) {
			ctx.redirect(`${API_EXPLORER_INDEX_PATH}${ctx.search}`);
			return;
		}

		if (ctx.path === API_EXPLORER_INDEX_PATH && options.publicDir) {
			ctx.type = 'text/html; charset=utf-8';
			ctx.body = await renderExplorerIndex(options.publicDir);
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
