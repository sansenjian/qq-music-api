export const commonParams = {
	g_tk: 1124214810,
	loginUin: (global.userInfo as any)?.uin || '0',
	hostUin: 0,
	inCharset: 'utf8',
	outCharset: 'utf-8',
	// format: 'json',
	notice: 0,
	platform: 'yqq.json',
	needNewCode: 0
};

export const _guid = (Math.round(2147483647 * Math.random()) * new Date().getUTCMilliseconds()) % 1e10;

export const options = {
	param: 'jsonpCallback',
	prefix: 'tan'
	// prefix: 'jp',
};

export const optionsPrefix = {
	param: 'jsonpCallback',
	prefix: 'playlistinfoCallback'
};
