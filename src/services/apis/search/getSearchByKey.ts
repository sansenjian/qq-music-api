import y_common from '../y_common';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';
import { observeService } from '../../../util/observability';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
	const { key, remoteplace, ...restParams } = params;
	const normalizedRemoteplace =
		typeof remoteplace === 'string' && remoteplace.trim() ? remoteplace.trim() : 'txt.yqq.song';
	const data = {
		format: 'json',
		outCharset: 'utf-8',
		ct: 24,
		qqmusic_ver: 1298,
		remoteplace: normalizedRemoteplace,
		t: 0,
		aggr: 1,
		cr: 1,
		lossless: 0,
		flag_qc: 0,
		platform: 'yqq.json',
		...restParams,
		...(restParams.w === undefined && key !== undefined ? { w: key } : {})
	};
	const options = {
		...option,
		params: data
	};
	return observeService('getSearchByKey', { method, params: data }, () =>
		handleApi(
			y_common({
				url: '/soso/fcgi-bin/client_search_cp',
				method: method,
				options,
				gateway: {
					module: 'music.search.SearchCgiService',
					method: 'DoSearchForQQMusicDesktop',
					buildParam: params => ({
						query: String(params.w ?? ''),
						num_per_page: Number(params.n || 10),
						page_num: Number(params.p || 1),
						search_type: 0,
						grp: 1,
					}),
					normalize: upstream => {
						const code = Number(upstream?.req_0?.code ?? -1);
						const body = upstream?.req_0?.data?.body || {};
						// 网关偶发返回 code 0 但无业务数据(空壳响应),视为失败并降级到镜像域名
						const songList = body?.song?.list as unknown[] | undefined;
						if (code === 0 && (!Array.isArray(songList) || songList.length === 0)) {
							throw Object.assign(new Error('u.y.qq.com gateway returned empty search result'), {
								code: 'ERR_GATEWAY',
							});
						}
						return { code, data: { ...body } };
					},
				},
			}),
		),
	);
};
