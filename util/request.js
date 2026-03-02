const axios = require('axios');
const colors = require('../util/colors');

// `withCredentials` 表示跨域请求时是否需要使用凭证
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8;text/plain;';
axios.defaults.responseType = 'json;text/plain;charset=utf-8;';

const setHeaders = headers => {
	return {
		...headers,
		cookies: global.userInfo.cookie,
	};
};

const yURL = 'https://y.qq.com';
const cURL = 'https://c.y.qq.com';
// let uURL = 'https:/u.y.qq.com/cgi-bin/musicu.fcg';

function request(url, method = 'GET', options = {}, isUUrl = 'c') {
	let baseURL = '';
	switch (isUUrl) {
		case 'y':
			baseURL = yURL + url;
			break;
		case 'u':
			baseURL = url;
			break;
		case 'c':
			baseURL = cURL + url;
			break;
		default:
			baseURL = cURL + url;
			break;
	}

	options = Object.assign(options, {
		headers: setHeaders(options.headers || {}),
	});

	return axios[method](baseURL, options).then(
		response => {
			if (!response) {
				throw Error('response is null');
			}
			console.log(colors.info(`${url} request success`));
			return response;
		},
		error => {
			console.log(colors.error(`${url} request error`));
			throw error;
		},
	);
}

module.exports = request;
