import { writeFileSync } from 'node:fs';

writeFileSync('dist/app.d.cts', "import type Koa from 'koa';\ndeclare const app: Koa;\nexport = app;\n");
writeFileSync('dist/index.d.cts', "import app = require('./app.cjs');\nexport = app;\n");
writeFileSync('dist/app.d.mts', "import app from './koaApp.js';\nexport default app;\n");
writeFileSync('dist/index.d.mts', "export { default } from './app.js';\n");
