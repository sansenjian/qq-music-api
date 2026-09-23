import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const appDeclaration = "import type Koa = require('koa');\ndeclare const app: Koa;\n";
const readDeclaration = path => readFileSync(path, 'utf8');
const addJsExtensions = declaration => declaration.replace(/from '(\.[^']*?)(?<!\.js)'/g, "from '$1.js'");

const sdkEsmDeclaration = () => addJsExtensions(readDeclaration('dist/sdk.d.ts'));
const sdkCjsDeclaration = () =>
	readDeclaration('dist/sdk.d.ts').replace(
		"import type { ApiOptions, ApiResponse } from './types/api';",
		'import type { ApiOptions, ApiResponse } from \'./types/api.js\' with { "resolution-mode": "import" };',
	);

/** 从声明文件中收集具名导出（支持 `export *` 递归展开，忽略 default 本身）。 */
const resolveDeclarationPath = (fromDir, spec) => {
	const base = join(fromDir, spec);
	if (base.endsWith('.d.ts')) return base;
	const direct = `${base}.d.ts`;
	try {
		readFileSync(direct);
		return direct;
	} catch {
		return join(base, 'index.d.ts');
	}
};

const collectExportedNames = declarationPath =>
	readDeclaration(declarationPath)
		.split('\n')
		.flatMap(line => {
			const starMatch = line.match(/^export \* from '([^']+)';$/);
			if (starMatch) {
				return collectExportedNames(resolveDeclarationPath(dirname(declarationPath), starMatch[1]));
			}

			const namedMatch = line.match(/^export \{ ([^}]+) \} from '([^']+)';$/);
			if (!namedMatch) return [];
			return namedMatch[1]
				.split(',')
				.map(name => name.trim().replace(/^default\s+as\s+/, ''))
				.filter(Boolean);
		})
		.filter((name, index, all) => all.indexOf(name) === index);

const serviceNamesDeclaration = () => {
	const serviceNames = collectExportedNames('dist/services/index.d.ts');
	const exports = serviceNames.map(name => `export declare const ${name}: ApiFunction;`);

	return [
		'import type { ApiFunction } from \'./types/api.js\' with { "resolution-mode": "import" };',
		...exports,
		'',
	].join('\n');
};

writeFileSync('dist/app.d.cts', `${appDeclaration}export = app;\n`);
writeFileSync('dist/index.d.cts', "import app = require('./app.cjs');\nexport = app;\n");
writeFileSync('dist/app.d.mts', `${appDeclaration}export default app;\n`);
writeFileSync('dist/index.d.mts', "export { default } from './app.js';\n");
writeFileSync('dist/app.d.ts', `${appDeclaration}export default app;\n`);
writeFileSync('dist/index.d.ts', "export { default } from './app.js';\n");
const servicesDeclaration = serviceNamesDeclaration();
writeFileSync('dist/services.d.cts', servicesDeclaration);
writeFileSync('dist/services.d.mts', servicesDeclaration);
writeFileSync('dist/services.d.ts', servicesDeclaration);
writeFileSync('dist/sdk.d.cts', sdkCjsDeclaration());
writeFileSync('dist/sdk.d.mts', sdkEsmDeclaration());
writeFileSync('dist/sdk.d.ts', readDeclaration('dist/sdk.d.ts'));
