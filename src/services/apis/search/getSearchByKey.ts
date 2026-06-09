import y_common from '../y_common';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';
import { observeService } from '../../../util/observability';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
	const { key, remoteplace, ...restParams } = params;
	const normalizedRemoteplace =
		typeof remoteplace === 'string' && remoteplace.trim() ? remoteplace.trim() : 'txt.yqq.song';
	const data = {
		format: 'json',
		outCharset: 'utf-8',
		ct: 24,
		qqmusic_ver: 1298,
		remoteplace: normalizedRemoteplace,
		t: 0,
		aggr: 1,
		cr: 1,
		lossless: 0,
		flag_qc: 0,
		platform: 'yqq.json',
		...restParams,
		...(restParams.w === undefined && key !== undefined ? { w: key } : {})
	};
	const options = {
		...option,
		params: data
	};
	return observeService('getSearchByKey', { method, params: data }, () =>
		handleApi(
			y_common({
				url: '/soso/fcgi-bin/client_search_cp',
				method: method,
				options
			})
		)
	);
};
