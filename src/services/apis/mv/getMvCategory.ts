import { getCommonParams } from '../../config';
import type { ApiOptions } from '../../../types/api';
import { callMusicuQuery } from '../musicu';

export default async ({ method = 'POST', option = {} }: ApiOptions) => {
	const data = {
		comm: {
			...getCommonParams(),
			ct: 24,
			cv: 0,
		},
		mv_tag: {
			module: 'MvService.MvInfoProServer',
			method: 'GetAllocTag',
			param: {},
		},
	};

	return callMusicuQuery(data, { method, option });
};
