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
		singerList: {
			module: 'Music.SingerListServer',
			method: 'get_singer_list',
			param: {
				area: -100,
				sex: -100,
				genre: -100,
				index: -100,
				sin: 0,
				cur_page: 1,
			},
		},
	};

	return callMusicuQuery(data, { method, option });
};
