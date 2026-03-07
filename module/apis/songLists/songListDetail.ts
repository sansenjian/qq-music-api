import { handleApi } from '../../../util/apiResponse';
import y_common from '../y_common';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
	const data = {
		...params,
		format: 'json',
		outCharset: 'utf-8',
		type: 1,
		json: 1,
		utf8: 1,
		onlysong: 0,
		new_format: 1
	};
	const options = {
		...option,
		params: data
	};
	return handleApi(
		y_common({
			url: '/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',
			method: method as string,
			options
		})
	);
};
