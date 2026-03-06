import { AxiosRequestConfig, Method } from 'axios';
import request from '../../util/request';

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
			...(option.headers || {})
		},
		params: data
	};
	return request('/download/download.js', method as Method, options, 'y')
		.then(res => {
			let response = res.data;
			if (typeof response === 'string') {
				const reg = /^\w+\(({[^()]+})\)$/;
				const matches = response.match(reg);
				if (matches) {
					response = JSON.parse(matches[1]);
				}
			}
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
				body: {
					error
				}
			};
		});
};
