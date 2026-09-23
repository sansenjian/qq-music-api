import u_common from '../u_common';

interface GetSingerAlbumParams {
	singermid?: string;
	num?: number;
	begin?: number;
}

/**
 * 获取歌手专辑列表
 */
export default async ({ singermid, num = 5, begin = 0 }: GetSingerAlbumParams = {}) => {
	const data = {
		comm: { ct: 24, cv: 0 },
		singer: {
			method: 'GetAlbumList',
			param: {
				sort: 5,
				singermid,
				begin,
				num,
			},
			module: 'music.musichallAlbum.AlbumListServer',
		},
	};

	const params = {
		format: 'json',
		singermid,
		data: JSON.stringify(data),
	};

	const response = await u_common({ method: 'get', params });
	return response.data;
};
