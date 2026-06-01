import { defineConfig, normalizePath } from 'vite';
import { resolve } from 'node:path';
import { oxcTransform } from './plugins/vite-plugin-oxc-transform';
import type { Plugin } from 'vite';

function nodeBinShebang(): Plugin {
	const binEntryIds = new Set([
		normalizePath(resolve(__dirname, 'src/app.ts')),
		normalizePath(resolve(__dirname, 'src/cli.ts')),
	]);

	return {
		name: 'node-bin-shebang',
		generateBundle(_, bundle) {
			let locatedEntries = 0;

			Object.values(bundle).forEach(output => {
				if (
					output.type !== 'chunk' ||
					!output.isEntry ||
					output.facadeModuleId === null ||
					!binEntryIds.has(normalizePath(output.facadeModuleId))
				) {
					return;
				}

				locatedEntries += 1;
				if (!output.code.startsWith('#!/usr/bin/env node')) {
					output.code = `#!/usr/bin/env node\n${output.code}`;
				}
			});

			if (locatedEntries !== binEntryIds.size) {
				this.error(`Expected ${binEntryIds.size} bin entry chunks, found ${locatedEntries}.`);
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
				cli: resolve(__dirname, 'src/cli.ts'),
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
