import { AxiosRequestConfig, Method } from 'axios';
import request from '../../util/request';
import { parseJsonp } from '../../util/parseJsonp';

interface DownloadOptions {
	method?: Method | string;
	params?: any;
	option?: AxiosRequestConfig;
}

export default ({ method = 'get', params = {}, option = {} }: DownloadOptions) => {
	const data = {
		...params,
		format: 'jsonp',
		jsonpCallback: 'MusicJsonCallback',
		platform: 'yqq'
	};
	const options: AxiosRequestConfig = {
		...option,
		headers: {
			host: 'y.qq.com',
			referer: 'https://y.qq.com/',
			...option.headers
		},
		params: data
	};
	return request({ url: '/download/download.js', method: method as Method, options, isUUrl: 'y' })
		.then(res => {
			const response = parseJsonp(res.data);
			return {
				status: 200,
				body: {
					response
				}
			};
		})
		.catch(error => {
			console.log('error', error);
			return {
				status: 502,
				body: {
					error: error instanceof Error ? error.message : error
				}
			};
		});
};
