import y_common from '../y_common';
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
		y_common({
			url: '/v8/fcg-bin/fcg_myqq_toplist.fcg',
			method: method as import('axios').Method,
			options,
			// 保持原有请求参数,不注入公共参数(commonParams)
			hasCommonParams: false,
		}),
		{
			transformData: (response: unknown) => parseJsonp(response),
		},
	);
};
