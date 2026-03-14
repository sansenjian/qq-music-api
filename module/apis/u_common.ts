import { AxiosRequestConfig, Method } from 'axios';
import request from '../../util/request';
import * as config from '../config';

interface UCommonOptions {
	options?: AxiosRequestConfig;
	method?: Method | string;
	customCookie?: string;
}

export default ({ options = {}, method = 'get', customCookie }: UCommonOptions) => {
	const opts: AxiosRequestConfig = { ...options };

	// Merge commonParams into params for query string
	opts.params = { ...config.commonParams, ...(opts.params || {}) };

	// Cookie 仅在显式传入时透传
	let cookieValue: string | undefined;
	if (customCookie) {
		cookieValue = customCookie;
	}

	opts.headers = {
		referer: 'https://y.qq.com/portal/player.html',
		host: 'u.y.qq.com',
		'content-type': 'application/x-www-form-urlencoded',
		...(cookieValue && { cookie: cookieValue }),
		...(opts.headers || {})
	};

	if (process.env.DEBUG === 'true') {
		const logOpts = { ...opts, headers: { ...opts.headers, cookie: '[REDACTED]' } };
		console.log('https://u.y.qq.com/cgi-bin/musicu.fcg', { opts: logOpts });
	}

	return request('https://u.y.qq.com/cgi-bin/musicu.fcg', method as Method, opts, 'u', customCookie);
};

