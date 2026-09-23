import { AxiosRequestConfig, Method } from 'axios';
import request from '../../util/request';
import * as config from '../config';

export interface UCommonOptions {
	options?: AxiosRequestConfig;
	/** 查询参数/请求体，合并进 options.params（兼容原 UCommon 的扁平形态） */
	params?: AxiosRequestConfig['params'];
	method?: Method | string;
	customCookie?: string;
}

interface UCommonCallParams {
	method?: Method | string;
	params?: AxiosRequestConfig['params'];
	option?: AxiosRequestConfig;
}

const u_common = ({ options = {}, params, method = 'get', customCookie }: UCommonOptions) => {
	const opts: AxiosRequestConfig = { ...options };

	// Merge explicit params (原 UCommon 形态) before common params
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

/** 兼容导出：原 UCommon/UCommon.ts 的扁平形态（{ method, params, option }） */
export const UCommon = ({ method = 'get', params = {}, option = {} }: UCommonCallParams) =>
	u_common({ method, options: { ...option, params } });