import { handleApi } from '../../../util/apiResponse';
import y_common from '../y_common';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
	const data = {
		...params,
		format: 'json',
		outCharset: 'utf-8'
	};
	const options = {
		...option,
		params: data
	};
	return handleApi(
		y_common({
			url: '/v8/fcg-bin/fcg_v8_album_info_cp.fcg',
			method: method as string,
			options
		})
	);
};
