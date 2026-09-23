import u_common from '../u_common';

interface GetSingerListParams {
	area?: number;
	sex?: number;
	genre?: number;
	index?: number;
	page?: number;
}

/**
 * 按地区 / 性别 / 风格 / 字母索引获取歌手列表，每页 80 个
 */
export default async ({ area = -100, sex = -100, genre = -100, index = -100, page = 1 }: GetSingerListParams = {}) => {
	const pageNum = Number(page);
	const data = {
		comm: {
			ct: 24,
			cv: 0,
		},
		singerList: {
			module: 'Music.SingerListServer',
			method: 'get_singer_list',
			param: {
				area: Number(area),
				sex: Number(sex),
				genre: Number(genre),
				index: Number(index),
				sin: (pageNum - 1) * 80,
				cur_page: pageNum,
			},
		},
	};

	const params = {
		format: 'json',
		data: JSON.stringify(data),
	};

	const response = await u_common({ method: 'get', params });
	return response.data;
};
