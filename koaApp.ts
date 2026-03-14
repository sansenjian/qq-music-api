import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import path from 'path';
import koaStatic from 'koa-static';
import cors from './middlewares/koa-cors';
import router from './routers/router';
import cookieMiddleware from './util/cookie';
import fallbackMiddleware from './middlewares/fallback-middleware';
import colors from './util/colors';
import userInfoImport from './config/user-info';
import type { UserInfo } from './types';

const app = new Koa();

global.userInfo = userInfoImport as UserInfo;

app.use(bodyParser());
app.use(fallbackMiddleware() as any);
app.use(cookieMiddleware() as any);
app.use(koaStatic(path.join(__dirname, 'public')) as any);

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

app.use(router.routes()).use(router.allowedMethods());

export default app;
