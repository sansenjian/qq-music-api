import { getUserUin } from '../config/user-info-store';

export const getCommonParams = () => ({
	g_tk: 1124214810,
	loginUin: getUserUin(),
	hostUin: 0,
	inCharset: 'utf8',
	outCharset: 'utf-8',
	notice: 0,
	platform: 'yqq.json',
	needNewCode: 0
});

export const _guid = (Math.round(2147483647 * Math.random()) * new Date().getUTCMilliseconds()) % 1e10;

export const options = {
	param: 'jsonpCallback',
	prefix: 'tan'
};

export const optionsPrefix = {
	param: 'jsonpCallback',
	prefix: 'playlistinfoCallback'
};
