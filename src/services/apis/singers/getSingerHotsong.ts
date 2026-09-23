import UCommon from '../UCommon/UCommon';

interface GetSingerHotsongParams {
	singermid?: string;
	num?: number;
	page?: number;
}

/**
 * 获取歌手热门歌曲
 */
export default async ({ singermid, num = 5, page = 0 }: GetSingerHotsongParams = {}) => {
	const data = {
		comm: { ct: 24, cv: 0 },
		singer: {
			method: 'get_singer_detail_info',
			param: {
				sort: 5,
				singermid,
				sin: (page - 1) * num,
				num,
			},
			module: 'music.web_singer_info_svr',
		},
	};

	const params = {
		format: 'json',
		singermid,
		data: JSON.stringify(data),
	};

	const response = await UCommon({ method: 'get', params, option: {} });
	return response.data;
};
