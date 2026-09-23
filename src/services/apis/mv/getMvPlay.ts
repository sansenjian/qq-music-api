import UCommon from '../UCommon/UCommon';

const DEFAULT_REQUIRED_FIELDS = [
	'vid',
	'type',
	'sid',
	'cover_pic',
	'duration',
	'singers',
	'video_switch',
	'msg',
	'name',
	'desc',
	'playcnt',
	'pubdate',
	'isfav',
	'gmid',
];

const OTHER_REQUIRED_FIELDS = [
	'vid',
	'type',
	'sid',
	'cover_pic',
	'duration',
	'singers',
	'video_switch',
	'msg',
	'name',
	'desc',
	'playcnt',
	'pubdate',
	'isfav',
	'gmid',
	'uploader_headurl',
	'uploader_nick',
	'uploader_encuin',
	'uploader_uin',
	'uploader_hasfollow',
	'uploader_follower_num',
];

/**
 * 获取 MV 播放地址，并按标清（f10）/ 高清（f20/f30/f40）归组
 */
export default async (vid: string) => {
	const data = {
		comm: {
			ct: 24,
			cv: 4747474,
		},
		getMVUrl: {
			module: 'gosrf.Stream.MvUrlProxy',
			method: 'GetMvUrls',
			param: {
				vids: [vid],
				request_typet: 10001,
			},
		},
		mvinfo: {
			module: 'video.VideoDataServer',
			method: 'get_video_info_batch',
			param: {
				vidlist: [vid],
				required: DEFAULT_REQUIRED_FIELDS,
			},
		},
		other: {
			module: 'video.VideoLogicServer',
			method: 'rec_video_byvid',
			param: {
				vid,
				required: OTHER_REQUIRED_FIELDS,
				support: 1,
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
