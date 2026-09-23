import UCommon from '../UCommon/UCommon';

interface GetMvParams {
	areaId?: number | string;
	versionId?: number | string;
	limit?: number;
	page?: number;
}

/**
 * 按版本 / 地区获取 MV 列表
 */
export default async ({ areaId = 15, versionId = 7, limit = 20, page = 0 }: GetMvParams = {}) => {
	const start = (+page ? +page - 1 : 0) * +limit;

	const data = {
		comm: {
			ct: 24,
		},
		mv_tag: {
			module: 'MvService.MvInfoProServer',
			method: 'GetAllocTag',
			param: {},
		},
		mv_list: {
			module: 'MvService.MvInfoProServer',
			method: 'GetAllocMvInfo',
			param: {
				start,
				limit: +limit,
				version_id: versionId,
				area_id: areaId,
				order: 1,
			},
		},
	};

	const params = {
		format: 'json',
		data: JSON.stringify(data),
	};

	const response = await UCommon({ method: 'get', params, option: {} });
	return response.data;
};
