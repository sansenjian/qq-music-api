import UCommon from '../UCommon/UCommon';
import { handleApi } from '../../../util/apiResponse';
import type { ApiOptions } from '../../../types/api';

export default async ({ method = 'get', params = {}, option = {} }: ApiOptions) => {
	const { disstid, ...restParams } = params;

	if (!disstid) {
		return { status: 400, body: { response: 'no disstid' } };
	}

	const requestPayload = {
		comm: {
			songlisttype: 0,
			format: 'json',
			ct: 24,
			cv: 0,
		},
		req_1: {
			module: 'comm.songlist.HeadInfo',
			method: 'GetDissHeadInfo',
			param: {
				diss_id: disstid,
			},
		},
		req_2: {
			module: 'comm.songlist.DetailInfo',
			method: 'GetDissDetailInfo',
			param: {
				diss_id: disstid,
			},
		},
		req_3: {
			module: 'music.musichallSong.PlayLyricInfo',
			method: 'GetPlayLyricInfo',
			param: {
				length: 0,
				songMIDList: [],
			},
		},
		req_4: {
			module: 'comm.songlist.SongList',
			method: 'GetSongList',
			param: {
				id: disstid,
				...restParams,
			},
		},
	};

	return handleApi(
		UCommon({
			method: method as any,
			params: {
				format: 'json',
				data: JSON.stringify(requestPayload),
			},
			option,
		})
	);
};
