import { resolve } from 'node:path';
import { defineConfig, normalizePath } from 'vite';
import type { Plugin } from 'vite';
import { oxcTransform } from '../../plugins/vite-plugin-oxc-transform';

const externalPackages = [
	'@modelcontextprotocol/sdk',
	'axios',
	'zod',
];

function nodeBinShebang(): Plugin {
	const binEntryId = normalizePath(resolve(__dirname, 'src/cli.ts'));

	return {
		name: 'mcp-node-bin-shebang',
		generateBundle(_, bundle) {
			let located = false;

			Object.values(bundle).forEach(output => {
				if (
					output.type !== 'chunk' ||
					!output.isEntry ||
					output.facadeModuleId === null ||
					normalizePath(output.facadeModuleId) !== binEntryId
				) {
					return;
				}

				located = true;
				if (!output.code.startsWith('#!/usr/bin/env node')) {
					output.code = `#!/usr/bin/env node\n${output.code}`;
				}
			});

			if (!located) {
				this.error(`Failed to locate MCP bin entry chunk for: ${binEntryId}`);
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
				cli: resolve(__dirname, 'src/cli.ts'),
				index: resolve(__dirname, 'src/index.ts'),
			},
			formats: ['es'],
		},
		outDir: 'dist',
		emptyOutDir: true,
		copyPublicDir: false,
		rollupOptions: {
			external: id => externalPackages.some(pkg => id === pkg || id.startsWith(`${pkg}/`)),
		},
	},
});
