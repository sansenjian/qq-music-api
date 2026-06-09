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
		focus: {
			module: 'QQMusic.MusichallServer',
			method: 'GetFocus',
			param: {},
		},
	};

	return callMusicuQuery(data, { method, option });
};
