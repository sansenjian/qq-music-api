import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		// Vitest 5 defaults `clearMocks` to true; keep the previous behavior
		// (mock call history is asserted across test boundaries in this suite).
		clearMocks: false,
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts'],
			exclude: ['**/node_modules/**', '**/tests/**', '**/dist/**', '**/*.d.ts', '**/types/**/*.ts'],
			reporter: ['text', 'lcov', 'html', 'json-summary', 'json'],
			thresholds: {
				branches: 35,
				functions: 40,
				lines: 50,
				statements: 50,
			},
		},
		testTimeout: 10000,
	},
	resolve: {
		alias: {
			'@services': resolve(__dirname, 'src/services'),
			'@routes': resolve(__dirname, 'src/routes'),
			'@controllers': resolve(__dirname, 'src/controllers'),
			'@util': resolve(__dirname, 'src/util'),
		},
	},
});
