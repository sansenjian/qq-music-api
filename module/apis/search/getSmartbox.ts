import { AxiosRequestConfig, Method } from 'axios';
import y_common from '../y_common';

interface GetSmartboxOptions {
	method?: Method | string;
	params?: any;
	option?: AxiosRequestConfig;
}

export default ({ method = 'get', params = {}, option = {} }: GetSmartboxOptions) => {
	const data = {
		...params,
		format: 'json',
		outCharset: 'utf-8',
		is_xml: 0
	};
	const options: AxiosRequestConfig = {
		...option,
		params: data
	};
	return y_common({
		url: '/splcloud/fcgi-bin/smartbox_new.fcg',
		method: method as Method,
		options
	})
		.then(res => {
			const response = res.data;
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
