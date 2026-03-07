import 'reflect-metadata';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import koaStatic from 'koa-static';
import chalk from 'chalk';
import cors from './middlewares/koa-cors';
import router from './routers/router';
import cookieMiddleware from './util/cookie';
import colors from './util/colors';
import userInfoImport from './config/user-info';
import pkg from './package.json';
import type { UserInfo } from './types/global';

const app = new Koa();

global.userInfo = userInfoImport as UserInfo;

console.log(chalk.green('\n🥳🎉 We had supported config the user cookies. \n'));
console.log(colors.info(`Current Version: ${pkg.version}`));

if(!((global.userInfo as any).loginUin || (global.userInfo as any).uin)){
  console.log(chalk.yellow(`😔 The configuration ${chalk.red('loginUin')} or your ${chalk.red('cookie')} in file ${chalk.green('config/user-info')} has not configured. \n`));
}

if (!(global.userInfo as any).cookie) {
  console.log(chalk.yellow(`😔 The configuration ${chalk.red('cookie')} in file ${chalk.green('config/user-info')} has not configured. \n`));
}

app.use(bodyParser());
app.use(cookieMiddleware() as any);
app.use(koaStatic(
  path.join(__dirname, 'public')
) as any);

// logger
app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.get('X-Response-Time');
  console.log(colors.prompt(`${ctx.method} ${ctx.url} - ${rt}`));
});

// cors
app.use(cors({
  origin: ctx => (ctx.request as any).header?.origin || '*',
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}) as any);

// x-response-time
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set('X-Response-Time', `${ms}ms`);
});

app.use(router.routes())
  .use(router.allowedMethods());

const PORT: number = typeof process.env.PORT === 'string' ? parseInt(process.env.PORT, 10) : (process.env.PORT || 3200);

(app.listen as any)(PORT, () => {
  console.log(colors.prompt(`server running @ http://localhost:${PORT}`));
});
