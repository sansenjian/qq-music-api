import { writeFileSync } from 'node:fs';

const appDeclaration = "import type Koa from 'koa';\ndeclare const app: Koa;\n";

writeFileSync('dist/app.d.cts', `${appDeclaration}export = app;\n`);
writeFileSync('dist/index.d.cts', `${appDeclaration}export = app;\n`);
writeFileSync('dist/app.d.mts', `${appDeclaration}export default app;\n`);
writeFileSync('dist/index.d.mts', `${appDeclaration}export default app;\n`);
