import { getCommonParams } from '../../config';
import type { ApiOptions } from '../../../types/api';
import { callMusicu } from '../musicu';

export default async ({ method = 'POST', params = {}, option = {} }: ApiOptions) => {
	const albummid = String(params.albummid || params.albumMid || '');
	const data = {
		comm: {
			...getCommonParams(),
			ct: 24,
			cv: 10000,
		},
		albumSonglist: {
			method: 'GetAlbumSongList',
			module: 'music.musichallAlbum.AlbumSongList',
			param: {
				albumMid: albummid,
				albumID: Number(params.albumid || params.albumID || 0),
				begin: Number(params.begin ?? params.offset ?? 0),
				num: Number(params.num ?? params.limit ?? 999),
				order: Number(params.order ?? 2),
			},
		},
	};

	return callMusicu(data, { method, option });
};
