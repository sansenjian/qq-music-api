import 'reflect-metadata';
import chalk from 'chalk';
import colors from './util/colors';
import serviceConfig from './config/service-config';
import pkg from './package.json';
import app from './koaApp';

// 输出服务配置信息
console.log(chalk.green('\n🎵 QQ Music API Service Starting...\n'));
console.log(colors.info(`Current Version: ${pkg.version}`));
console.log(colors.info(`Fallback Mode: ${serviceConfig.fallbackMode ? 'Enabled' : 'Disabled'}`));
console.log(colors.info(`Use Global Cookie: ${serviceConfig.useGlobalCookie ? 'Yes' : 'No'}`));

if (serviceConfig.fallbackMode) {
  console.log(chalk.green('\n✅ 降级模式已启用：支持手动传递 Cookie\n'));
  console.log('使用方式:');
  console.log('  1. Query 参数：GET /api/endpoint?cookie=your_cookie');
  console.log('  2. Header: X-Custom-Cookie: your_cookie');
  console.log('  3. Header: Cookie: your_cookie\n');
}

if (!serviceConfig.useGlobalCookie) {
  console.log(chalk.yellow('\n⚠️  全局 Cookie 未启用：需要登录的接口请手动传递 Cookie\n'));
}

if (serviceConfig.useGlobalCookie) {
  console.log(chalk.green('\n✅ 全局 Cookie 已启用\n'));
  
  if (!((global.userInfo as any).loginUin || (global.userInfo as any).uin)) {
    console.log(chalk.yellow(`😔 The configuration ${chalk.red('loginUin')} or your ${chalk.red('cookie')} in file ${chalk.green('config/user-info')} has not configured. \n`));
  }

  if (!(global.userInfo as any).cookie) {
    console.log(chalk.yellow(`😔 The configuration ${chalk.red('cookie')} in file ${chalk.green('config/user-info')} has not configured. \n`));
  }
}

const PORT: number = typeof process.env.PORT === 'string' ? parseInt(process.env.PORT, 10) : (process.env.PORT || 3200);
const isMainModule = require.main === module;

if (isMainModule) {
  (app.listen as any)(PORT, () => {
    console.log(colors.prompt(`server running @ http://localhost:${PORT}`));
  });
}

export default app;
