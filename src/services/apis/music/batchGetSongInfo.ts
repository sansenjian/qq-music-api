import { UCommon } from '../u_common';

/**
 * 批量获取歌曲详情
 * @param songs - [song_mid, song_id][] 二元组数组
 */
export default async (songs: Array<[string, string?]> = []) => {
	const params = {
		format: 'json',
		inCharset: 'utf8',
		outCharset: 'utf-8',
		notice: 0,
		platform: 'yqq.json',
		needNewCode: 0,
	};

	const data = await Promise.all(
		songs.map(async ([song_mid, song_id = '']) => {
			const response = await UCommon({
				method: 'get',
				option: {},
				params: {
					...params,
					data: {
						comm: {
							ct: 24,
							cv: 0,
						},
						songinfo: {
							method: 'get_song_detail_yqq',
							param: {
								song_type: 0,
								song_mid,
								song_id,
							},
							module: 'music.pf_song_detail_svr',
						},
					},
				},
			});
			return response.data;
		}),
	);

	return { code: 0, data };
};
