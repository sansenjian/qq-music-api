import { resolve } from 'node:path';
import { build } from 'vite';
import { oxcTransform } from '../plugins/vite-plugin-oxc-transform';

await build({
	configFile: false,
	plugins: [oxcTransform()],
	build: {
		target: 'es2020',
		emptyOutDir: false,
		minify: false,
		lib: {
			entry: resolve(process.cwd(), 'src/explorer/explorerApp.ts'),
			formats: ['iife'],
			name: 'QqMusicApiExplorer',
			fileName: () => 'app.js',
		},
		outDir: resolve(process.cwd(), 'public/explorer'),
		copyPublicDir: false,
		rollupOptions: {
			output: {
				banner: '/* Generated from src/explorer/explorerApp.ts. Do not edit manually. */',
				extend: true,
			},
		},
	},
});
