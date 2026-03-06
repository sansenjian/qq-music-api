import y_common from '../y_common';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
	const data = {
		...params,
		format: 'json',
		outCharset: 'utf-8',
		ct: 24,
		qqmusic_ver: 1298,
		remoteplace: 'txt.yqq.song',
		t: 0,
		aggr: 1,
		cr: 1,
		lossless: 0,
		flag_qc: 0,
		platform: 'yqq.json'
	};
	const options = {
		...option,
		params: data
	};
	return handleApi(
		y_common({
			url: '/soso/fcgi-bin/client_search_cp',
			method: method as string,
			options
		})
	);
};
