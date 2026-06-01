import { Router } from '@koa/router';
import context from '../controllers';
import { apiMetadata, type ApiMetadataItem, type ApiMethod } from './api-metadata';
import type { Controller } from './types';

export { apiMetadata };

const router = new Router();
const controllers = context as Record<string, Controller>;

const getPaths = (item: ApiMetadataItem) => [item.path, ...(item.aliases || [])];

const registerRoute = (method: ApiMethod, path: string, controller: Controller) => {
	switch (method) {
		case 'GET':
			router.get(path, controller);
			return;
		case 'POST':
			router.post(path, controller);
			return;
		case 'DELETE':
			router.delete(path, controller);
			return;
		default: {
			const exhaustiveMethod: never = method;
			throw new Error(`Unsupported API method: ${exhaustiveMethod}`);
		}
	}
};

apiMetadata.forEach(item => {
	const controller = controllers[item.name];
	if (!controller) {
		throw new Error(`Missing controller for API metadata item: ${item.name}`);
	}

	getPaths(item).forEach(path => registerRoute(item.method, path, controller));
});

export default router;
