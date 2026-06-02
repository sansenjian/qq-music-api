import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
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

const declarationFiles = [];

const collectDeclarationFiles = directory => {
	for (const entryName of readdirSync(directory)) {
		const entryPath = join(directory, entryName);
		const entryStats = statSync(entryPath);

		if (entryStats.isDirectory()) {
			collectDeclarationFiles(entryPath);
			continue;
		}

		if (entryStats.isFile() && entryName.endsWith('.d.ts')) {
			declarationFiles.push(entryPath);
		}
	}
};

const rewriteSpecifier = specifier => {
	if (specifier.endsWith('.d.ts') || specifier.endsWith('.d.mts') || specifier.endsWith('.d.cts')) {
		return specifier;
	}

	if (/(\.c|\.m)?js$|\.json$/.test(specifier)) {
		return specifier;
	}

	return `${specifier}.js`;
};

collectDeclarationFiles(join(packageRoot, 'dist'));

for (const declarationPath of declarationFiles) {
	const declaration = readFileSync(declarationPath, 'utf8').replace(
		/(from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g,
		(_, prefix, specifier, suffix) => `${prefix}${rewriteSpecifier(specifier)}${suffix}`,
	);
	writeFileSync(declarationPath, declaration);
}

rmSync(tempDir, { recursive: true, force: true });
