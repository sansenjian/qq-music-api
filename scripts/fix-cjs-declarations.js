import { writeFileSync } from 'node:fs';

const appDeclaration = "import type Koa = require('koa');\ndeclare const app: Koa;\n";

writeFileSync('dist/app.d.cts', `${appDeclaration}export = app;\n`);
writeFileSync('dist/index.d.cts', "import app = require('./app.cjs');\nexport = app;\n");
writeFileSync('dist/app.d.mts', `${appDeclaration}export default app;\n`);
writeFileSync('dist/index.d.mts', "export { default } from './app.js';\n");
writeFileSync('dist/app.d.ts', `${appDeclaration}export default app;\n`);
writeFileSync('dist/index.d.ts', "export { default } from './app.js';\n");
