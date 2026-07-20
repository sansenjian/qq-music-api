import { handleApi } from '../../../util/apiResponse';
import { parseJsonp } from '../../../util/parseJsonp';
import y_common from '../y_common';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
	const data = {
		...params,
		format: 'json',
		outCharset: 'utf-8',
		picmid: 1
	};
	const options = {
		...option,
		params: data
	};
	return handleApi(
		y_common({
			url: '/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg',
			method: method,
			options
		}),
		{
			transformData: (response: unknown) => parseJsonp(response)
		}
	);
};
