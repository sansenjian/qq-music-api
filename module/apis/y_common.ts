import { AxiosRequestConfig, Method } from 'axios';
import request from '../../util/request';
import * as config from '../config';

interface YCommonOptions {
	url: string;
	method?: Method | string;
	options?: AxiosRequestConfig;
	hasCommonParams?: boolean;
}

export default ({ url, method = 'get', options = {}, hasCommonParams = true }: YCommonOptions) => {
	const opts: AxiosRequestConfig = { ...options };

	// Merge commonParams into params
	// commonParams acts as defaults, specific params override them
	if (hasCommonParams) {
		opts.params = { ...config.commonParams, ...(opts.params || {}) };
	} else {
		opts.params = { ...(opts.params || {}) };
	}

	opts.headers = {
		referer: 'https://c.y.qq.com/',
		host: 'c.y.qq.com',
		...(opts.headers || {})
	};

	if (process.env.DEBUG === 'true') {
		const logOpts = { ...opts, headers: { ...opts.headers } };
		const SENSITIVE_HEADER_KEYS = ['cookie', 'authorization', 'proxy-authorization'];

		if (logOpts.headers) {
			Object.keys(logOpts.headers).forEach(key => {
				if (SENSITIVE_HEADER_KEYS.includes(key.toLowerCase())) {
					(logOpts.headers as any)[key] = '[masked]';
				}
			});
		}

		console.log(url, { opts: logOpts });
	}
	return request(url, method as Method, opts);
};
