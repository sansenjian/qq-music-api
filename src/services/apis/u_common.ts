import { AxiosRequestConfig, Method } from 'axios';
import request from '../../util/request';
import * as config from '../config';

export interface UCommonOptions {
	options?: AxiosRequestConfig;
	/** 查询参数/请求体，合并进 options.params */
	params?: AxiosRequestConfig['params'];
	method?: Method | string;
	customCookie?: string;
}

const u_common = ({ options = {}, params, method = 'get', customCookie }: UCommonOptions) => {
	const opts: AxiosRequestConfig = { ...options };

	// Merge explicit params before common params
	if (params !== undefined) {
		opts.params = params;
	}

	// Merge commonParams into params for query string
	opts.params = { ...config.getCommonParams(), ...opts.params };

	opts.headers = {
		referer: 'https://y.qq.com/portal/player.html',
		host: 'u.y.qq.com',
		'content-type': 'application/x-www-form-urlencoded',
		...opts.headers
	};

	if (process.env.DEBUG === 'true') {
		const logOpts = { ...opts, headers: { ...opts.headers, cookie: '[REDACTED]' } };
		console.log('https://u.y.qq.com/cgi-bin/musicu.fcg', { opts: logOpts });
	}

	return request({
		url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
		method: method as Method,
		options: opts,
		isUUrl: 'u',
		cookie: customCookie
	});
};

export default u_common;