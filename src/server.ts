import { styleText } from 'node:util';
import colors from './util/colors';
import serviceConfig from './config/service-config';
import { getUserInfo } from './config/user-info-store';
import app from './koaApp';
import pkg from '../package.json';

const parsedPort = Number.parseInt(process.env.PORT ?? '', 10);
const PORT: number = Number.isFinite(parsedPort) ? parsedPort : 3200;

export interface StartServerOptions {
	port?: number;
	json?: boolean;
}

export const startServer = (options: StartServerOptions = {}) => {
	const port = options.port ?? PORT;

	if (!options.json) {
		console.log(styleText('green', '\n🎵 QQ Music API Service Starting...\n'));
		console.log(colors.info(`Current Version: ${pkg.version}`));
		console.log(colors.info(`Fallback Mode: ${serviceConfig.fallbackMode ? 'Enabled' : 'Disabled'}`));
		console.log(colors.info(`Use Global Cookie: ${serviceConfig.useGlobalCookie ? 'Yes' : 'No'}`));

		if (serviceConfig.fallbackMode) {
			console.log(styleText('green', '\n✅ 降级模式已启用：支持手动传递 Cookie\n'));
			console.log('使用方式:');
			console.log('  1. Query 参数：GET /api/endpoint?cookie=your_cookie');
			console.log('  2. Header: X-Custom-Cookie: your_cookie');
			console.log('  3. Header: Cookie: your_cookie\n');
		}

		if (!serviceConfig.useGlobalCookie) {
			console.log(styleText('yellow', '\n⚠️  全局 Cookie 未启用：需要登录的接口请手动传递 Cookie\n'));
		} else {
			console.log(styleText('green', '\n✅ 全局 Cookie 已启用\n'));
			const userInfo = getUserInfo();

			if (!(userInfo.loginUin || userInfo.uin)) {
				console.log(
					styleText(
						'yellow',
						`😔 The configuration ${styleText('red', 'loginUin')} or your ${styleText('red', 'cookie')} in file ${styleText('green', 'config/user-info')} has not configured. \n`,
					),
				);
			}

			if (!userInfo.cookie) {
				console.log(
					styleText(
						'yellow',
						`😔 The configuration ${styleText('red', 'cookie')} in file ${styleText('green', 'config/user-info')} has not configured. \n`,
					),
				);
			}
		}
	}

	const server = app.listen(port, () => {
		if (options.json) {
			console.log(JSON.stringify({ ok: true, command: 'serve', port }));
			return;
		}

		console.log(colors.prompt(`server running @ http://localhost:${port}`));
		console.log(colors.info(`open playground @ http://localhost:${port}/index.html`));
	});

	server.on('error', (error: NodeJS.ErrnoException) => {
		if (error.code === 'EADDRINUSE') {
			console.error(colors.error(`Port ${port} is already in use.`));
			console.error(colors.warn('Stop the existing process or set PORT to another value before running again.'));
			process.exit(1);
		}

		console.error(colors.error('Failed to start server.'));
		console.error(error);
		process.exit(1);
	});
	return server;
};
