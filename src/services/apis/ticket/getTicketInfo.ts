import u_common from '../u_common';

/**
 * 获取票务（演出）首页信息
 */
export default async () => {
	const data = {
		comm: { ct: 24, cv: 0 },
		getFirstData: {
			module: 'mall.ticket_index_page_svr',
			method: 'GetTicketIndexPage',
			param: { city_id: -1 },
		},
		getTag: {
			module: 'mall.ticket_index_page_svr',
			method: 'GetShowTypeList',
			param: {},
		},
	};

	const params = {
		format: 'json',
		inCharset: 'utf8',
		outCharset: 'GB2312',
		platform: 'yqq.json',
		data: JSON.stringify(data),
	};

	const res = await u_common({ method: 'get', params });
	return res.data;
};
