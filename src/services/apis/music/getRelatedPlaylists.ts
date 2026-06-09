import { getCommonParams } from '../../config';
import type { ApiOptions } from '../../../types/api';
import { callMusicu } from '../musicu';

export default async ({ method = 'POST', params = {}, option = {} }: ApiOptions) => {
	const songid = Number(params.songid || params.id || 0);
	const data = {
		comm: {
			...getCommonParams(),
			format: 'json',
			inCharset: 'utf-8',
			outCharset: 'utf-8',
			platform: 'h5',
			needNewCode: 1,
		},
		gedan: {
			module: 'music.mb_gedan_recommend_svr',
			method: 'get_related_gedan',
			param: {
				sin: Number(params.sin || 0),
				last_id: Number(params.lastId || params.last_id || 0),
				song_type: Number(params.songType || params.song_type || 1),
				song_id: songid,
			},
		},
	};

	return callMusicu(data, { method, option });
};
