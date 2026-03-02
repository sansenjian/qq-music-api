const { UCommon } = require('../../module');
const { _guid } = require('../../module/config');

const ALLOWED_QUALITIES = ['m4a', 128, 320, 'ape', 'flac'];
const DEFAULT_QUALITY = 128;

const parseQuality = quality => {
	const parsed = parseInt(quality) || quality;
	return ALLOWED_QUALITIES.includes(parsed) ? parsed : DEFAULT_QUALITY;
};

module.exports = async (ctx, next) => {
	const uin = global.userInfo.uin || '0';
	const songmid = ctx.query.songmid + '';
	const justPlayUrl = (ctx.query.resType || 'play') === 'play';
	const guid = _guid ? _guid + '' : '1429839143';
	const { mediaId } = ctx.query;
	const quality = parseQuality(ctx.query.quality);
	const fileType = {
		m4a: {
			s: 'C400',
			e: '.m4a',
		},
		128: {
			s: 'M500',
			e: '.mp3',
		},
		320: {
			s: 'M800',
			e: '.mp3',
		},
		ape: {
			s: 'A000',
			e: '.ape',
		},
		flac: {
			s: 'F000',
			e: '.flac',
		},
	};
	const songmidList = songmid.split(',');
	const fileInfo = fileType[quality];
	const file = songmidList.map(_ => `${fileInfo.s}${_}${mediaId || _}${fileInfo.e}`);
	const data = {
		// req: {
		// 	module: 'CDN.SrfCdnDispatchServer',
		// 	method: 'GetCdnDispatch',
		// 	param: {
		// 		guid,
		// 		calltype: 0,
		// 		userip: '',
		// 	},
		// },
		req_0: {
			module: 'vkey.GetVkeyServer',
			method: 'CgiGetVkey',
			param: {
				filename: file,
				guid,
				songmid: songmidList,
				songtype: [0],
				uin,
				loginflag: 1,
				platform: '20',
			},
		},
		loginUin: uin,
		comm: {
			uin,
			format: 'json',
			ct: 24,
			cv: 0,
		},
	};
	const params = Object.assign({
		format: 'json',
		sign: 'zzannc1o6o9b4i971602f3554385022046ab796512b7012',
		data: JSON.stringify(data),
	});
	const props = {
		method: 'get',
		params,
		option: {},
	};

	if (songmid) {
		await UCommon(props)
			.then(res => {
				const response = res.data;
				const domain =
					response?.req_0?.data?.sip?.filter?.(i => !i.startsWith('http://ws'))?.[0] || response?.req_0?.data?.sip?.[0];

				const playUrl = {};
				(response?.req_0?.data?.midurlinfo || []).forEach(item => {
					playUrl[item.songmid] = {
						url: item.purl ? `${domain}${item.purl}` : '',
						error: !item.purl && '暂无播放链接',
					};
				});
				response.playUrl = playUrl;
				ctx.body = {
					data: justPlayUrl ? { playUrl } : response,
				};
			})
			.catch(error => {
				console.log('error', error);
			});
	} else {
		ctx.status = 400;
		ctx.body = {
			data: {
				message: 'no songmid',
			},
		};
	}
};
