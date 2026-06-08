import { readFileSync, writeFileSync } from 'node:fs';

const appDeclaration = "import type Koa = require('koa');\ndeclare const app: Koa;\n";
const readDeclaration = (path) => readFileSync(path, 'utf8');
const addJsExtensions = (declaration) =>
	declaration.replace(/from '(\.[^']*?)(?<!\.js)'/g, "from '$1.js'");

const sdkEsmDeclaration = () => addJsExtensions(readDeclaration('dist/sdk.d.ts'));
const sdkCjsDeclaration = () =>
	readDeclaration('dist/sdk.d.ts').replace(
		"import type { ApiOptions, ApiResponse } from './types/api';",
		'import type { ApiOptions, ApiResponse } from \'./types/api.js\' with { "resolution-mode": "import" };',
	);

const serviceNamesDeclaration = () => {
	const declaration = readDeclaration('dist/services/index.d.ts');
	const exportMatch = declaration.match(/export \{ (?<names>[^}]+) \};/);
	if (!exportMatch?.groups?.names) {
		throw new Error('Unable to locate services export list in dist/services/index.d.ts');
	}

	const serviceNames = exportMatch.groups.names
		.split(',')
		.map(name => name.trim())
		.filter(Boolean);
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
