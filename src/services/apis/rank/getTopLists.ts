import request from '../../../util/request';
import { handleApi } from '../../../util/apiResponse';
import { parseJsonp } from '../../../util/parseJsonp';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
	const data = {
		...params,
		format: 'json',
		outCharset: 'utf-8',
		platform: 'h5',
		needNewCode: 1,
	};

	const options = {
		...option,
		params: data,
	};

	return handleApi(
		request({
			url: '/v8/fcg-bin/fcg_myqq_toplist.fcg',
			method: method as import('axios').Method,
			options,
			isUUrl: 'c',
		}),
		{
			transformData: (response: unknown) => parseJsonp(response),
		},
	);
};
