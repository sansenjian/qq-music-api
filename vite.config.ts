import { defineConfig, normalizePath } from 'vite';
import { resolve } from 'node:path';
import { oxcTransform } from './plugins/vite-plugin-oxc-transform';
import type { Plugin } from 'vite';

function nodeBinShebang(): Plugin {
	const appEntryId = normalizePath(resolve(__dirname, 'src/app.ts'));

	return {
		name: 'node-bin-shebang',
		generateBundle(_, bundle) {
			const appChunk = Object.values(bundle).find(
				(output) =>
					output.type === 'chunk' &&
					output.isEntry &&
					output.facadeModuleId !== null &&
					normalizePath(output.facadeModuleId) === appEntryId,
			);

			if (!appChunk || appChunk.type !== 'chunk') {
				this.error(`Failed to locate the app entry chunk for ${appEntryId}`);
			}

			if (!appChunk.code.startsWith('#!/usr/bin/env node')) {
				appChunk.code = `#!/usr/bin/env node\n${appChunk.code}`;
			}
		},
	};
}

export default defineConfig({
	plugins: [oxcTransform(), nodeBinShebang()],
	build: {
		target: 'node20',
		ssr: true,
		lib: {
			entry: {
				app: resolve(__dirname, 'src/app.ts'),
				index: resolve(__dirname, 'src/index.ts'),
			},
			formats: ['es', 'cjs'],
		},
		outDir: 'dist',
		emptyOutDir: true,
		copyPublicDir: false,
		rollupOptions: {
			external: [
				'koa',
				'@koa/router',
				'axios',
			],
		},
	},
	resolve: {
		alias: {
			'~': resolve(__dirname, 'src'),
		},
	},
});
