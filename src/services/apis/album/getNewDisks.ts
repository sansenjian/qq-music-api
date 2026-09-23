import UCommon from '../UCommon/UCommon';

interface GetNewDisksParams {
	page?: number;
	num?: number;
}

/**
 * 获取最新专辑（新碟首发）
 */
export default async ({ page = 1, num = 20 }: GetNewDisksParams = {}) => {
	const start = (page - 1) * num;

	const data: Record<string, unknown> = {
		new_album: {
			module: 'newalbum.NewAlbumServer',
			method: 'get_new_album_info',
			param: { area: 1, start, num },
		},
		comm: { ct: 24, cv: 0 },
	};

	if (!start) {
		data.new_album_tag = {
			module: 'newalbum.NewAlbumServer',
			method: 'get_new_album_area',
			param: {},
		};
	}

	const params = { format: 'json', data: JSON.stringify(data) };
	const res = await UCommon({ method: 'get', params, option: {} });
	return res.data;
};
