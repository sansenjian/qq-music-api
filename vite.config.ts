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
			const locatedEntryIds = new Set<string>();

			Object.values(bundle).forEach(output => {
				if (
					output.type !== 'chunk' ||
					!output.isEntry ||
					output.facadeModuleId === null
				) {
					return;
				}

				const facadeModuleId = normalizePath(output.facadeModuleId);
				if (!binEntryIds.has(facadeModuleId)) {
					return;
				}

				locatedEntryIds.add(facadeModuleId);
				if (!output.code.startsWith('#!/usr/bin/env node')) {
					output.code = `#!/usr/bin/env node\n${output.code}`;
				}
			});

			const missingEntryIds = [...binEntryIds].filter(entryId => !locatedEntryIds.has(entryId));
			if (missingEntryIds.length > 0) {
				this.error(`Failed to locate bin entry chunks for: ${missingEntryIds.join(', ')}`);
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
