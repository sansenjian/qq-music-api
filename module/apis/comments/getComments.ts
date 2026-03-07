import { handleApi } from '../../../util/apiResponse';
import y_common from '../y_common';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
	const data = {
		...params,
		format: 'json',
		outCharset: 'GB2312',
		domain: 'qq.com',
		ct: 24,
		cv: 10101010,
		needmusiccrit: 0
	};
	const options = { ...option, params: data };
	return handleApi(
		y_common({
			url: '/base/fcgi-bin/fcg_global_comment_h5.fcg',
			method: method as string,
			options
		})
	);
};
