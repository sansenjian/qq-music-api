const dayjs = require('dayjs');
const y_common = require('../y_common');

module.exports = ({ method = 'get', params = {}, option = {} }) => {
	const hasCommonParams = false;
	const data = Object.assign(params, {
		format: 'xml',
		outCharset: 'utf-8',
		utf8: 1,
		r: dayjs().valueOf(),
	});
	const options = Object.assign(option, {
		params: data,
	});
	return y_common({
		url: '/splcloud/fcgi-bin/fcg_get_singer_desc.fcg',
		method,
		options,
		hasCommonParams,
	})
		.then(res => {
			const response = res.data;
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
				body: {
					error,
				},
			};
		});
};
