import type { Method } from 'axios';
import uCommon from './u_common';
import { handleApi } from '../../util/apiResponse';
import type { ApiOptions, ApiResponse } from '../../types/api';

export const callMusicu = (
	data: Record<string, unknown>,
	{ method = 'POST', option = {}, cookie }: Pick<ApiOptions, 'method' | 'option'> & { cookie?: string } = {},
): Promise<ApiResponse> => {
	const optionRecord = option as Record<string, any>;
	const headers = {
		...optionRecord.headers,
		'Content-Type': optionRecord.headers?.['Content-Type'] || 'application/json',
	};

	return handleApi(
		uCommon({
			method: method as Method,
			customCookie: cookie,
			options: {
				...optionRecord,
				data: JSON.stringify(data),
				headers,
			},
		}),
	);
};

export const callMusicuQuery = (
	data: Record<string, unknown>,
	{ method = 'GET', option = {}, cookie }: Pick<ApiOptions, 'method' | 'option'> & { cookie?: string } = {},
): Promise<ApiResponse> => {
	const optionRecord = option as Record<string, any>;

	return handleApi(
		uCommon({
			method: method as Method,
			customCookie: cookie,
			options: {
				...optionRecord,
				params: {
					...optionRecord.params,
					format: 'json',
					data: JSON.stringify(data),
				},
			},
		}),
	);
};
