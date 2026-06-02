import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const projectRoot = resolve(packageRoot, '..', '..');
const tempDir = join(packageRoot, 'dist', '.types-temp');
const generatedSourceDir = join(tempDir, 'packages', 'mcp', 'src');
const tscBin = require.resolve('typescript/bin/tsc');

rmSync(tempDir, { recursive: true, force: true });

execFileSync(
	process.execPath,
	[
		tscBin,
		'--ignoreConfig',
		'--declaration',
		'--emitDeclarationOnly',
		'--outDir',
		tempDir,
		'--rootDir',
		projectRoot,
		'--module',
		'ESNext',
		'--moduleResolution',
		'bundler',
		'--target',
		'ES2020',
		'--lib',
		'es2020',
		'--esModuleInterop',
		'--skipLibCheck',
		'--strict',
		'--resolveJsonModule',
		'--types',
		'node',
		join(packageRoot, 'src', 'index.ts'),
	],
	{ cwd: projectRoot, stdio: 'inherit' },
);

mkdirSync(join(packageRoot, 'dist'), { recursive: true });
cpSync(generatedSourceDir, join(packageRoot, 'dist'), { recursive: true });

for (const fileName of ['index.d.ts', 'server.d.ts', 'tools.d.ts']) {
	const declarationPath = join(packageRoot, 'dist', fileName);
	const declaration = readFileSync(declarationPath, 'utf8').replace(
		/(from\s+['"]\.\/(?:server|tools))(['"])/g,
		'$1.js$2',
	);
	writeFileSync(declarationPath, declaration);
}

rmSync(tempDir, { recursive: true, force: true });
