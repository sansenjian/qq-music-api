const { lyricParse } = require('../../../util/lyricParse');
const dayjs = require('dayjs');
const y_common = require('../y_common');

module.exports = ({ method = 'get', params = {}, option = {}, isFormat = false }) => {
	const data = Object.assign(params, {
		format: 'json',
		outCharset: 'utf-8',
		pcachetime: dayjs().valueOf(),
	});
	const options = Object.assign(option, {
		params: data,
	});
	return y_common({
		url: '/lyric/fcgi-bin/fcg_query_lyric_new.fcg',
		method,
		options,
	})
		.then(res => {
			const lyricString = res.data && res.data.lyric && Buffer.from(res.data.lyric, 'base64').toString();
			const lyric = isFormat && lyricString ? lyricParse(lyricString) : lyricString;
			const response = {
				...res.data,
				lyric,
			};
			return {
				status: 200,
				body: {
					response,
				},
			};
		})
		.catch(error => {
			console.log('error', error);
			return {
				status: 500,
				body: {
					error,
				},
			};
		});
};
