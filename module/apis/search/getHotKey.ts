import y_common from '../y_common';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
	const data = {
		...params,
		format: 'json',
		outCharset: 'utf-8',
		hostUin: 0,
		needNewCode: 0
	};
	const options = {
		...option,
		params: data
	};
	return handleApi(
		y_common({
			url: '/splcloud/fcgi-bin/gethotkey.fcg',
			method: method as string,
			options
		})
	);
};
