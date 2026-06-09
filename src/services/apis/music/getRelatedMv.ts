import { getCommonParams } from '../../config';
import type { ApiOptions } from '../../../types/api';
import { callMusicu } from '../musicu';

export default async ({ method = 'POST', params = {}, option = {} }: ApiOptions) => {
	const songid = String(params.songid || params.id || '');
	const data = {
		comm: {
			...getCommonParams(),
			format: 'json',
			inCharset: 'utf-8',
			outCharset: 'utf-8',
			platform: 'h5',
			needNewCode: 1,
		},
		video: {
			module: 'MvService.MvInfoProServer',
			method: 'GetSongRelatedMv',
			param: {
				songid,
				songtype: Number(params.songtype || params.songType || 1),
				lastmvid: Number(params.lastmvid || params.lastMvId || 0),
				num: Number(params.num || params.limit || 10),
			},
		},
	};

	return callMusicu(data, { method, option });
};
