import axios, { AxiosRequestConfig, Method } from 'axios';
import http from 'http';
import https from 'https';
import colors from './colors';

// Create dedicated instance
const service = axios.create({
	withCredentials: true,
	timeout: 15000,
	responseType: 'json',
	// Enable keep-alive for better performance
	httpAgent: new http.Agent({ keepAlive: true }),
	httpsAgent: new https.Agent({ keepAlive: true })
});

const ensureContentType = (config: AxiosRequestConfig) => {
	const method = (config.method || 'get').toLowerCase();
	const hasBody = config.data !== undefined && config.data !== null;
	const headers = config.headers || {};
	const hasContentType = Boolean((headers as any)['Content-Type'] || (headers as any)['content-type']);

	if (hasBody && !hasContentType && ['post', 'put', 'patch', 'delete'].includes(method)) {
		(headers as any)['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
	}

	config.headers = headers;
};

// Request interceptor to ensure headers
service.interceptors.request.use(
	config => {
		// Ensure User-Agent
		if (config.headers && !config.headers['User-Agent']) {
			config.headers['User-Agent'] =
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
		}

		ensureContentType(config);
		return config;
	},
	error => {
		return Promise.reject(error);
	}
);

// Response interceptor
service.interceptors.response.use(
	response => {
		if (!response) {
			throw Error('response is null');
		}
		if (process.env.DEBUG === 'true') {
			console.log(colors.info(`${response.config.url} request success`));
		}
		return response;
	},
	error => {
		const url = error.config ? error.config.url : 'Unknown URL';
		console.log(colors.error(`${url} request error: ${error.message}`));
		return Promise.reject(error);
	}
);

const yURL = 'https://y.qq.com';
const cURL = 'https://c.y.qq.com';

export interface RequestConfig {
  url?: string;
  method?: string;
  options?: any;
  isUUrl?: string;
  headers?: Record<string, any>;
}

function request(configOrUrl: string | RequestConfig, method?: string, options?: any, isUUrl?: string): Promise<any> {
  let url: string;
  let reqMethod: string;
  let reqOptions: any;
  let reqIsUUrl: string;
  
  if (typeof configOrUrl === 'object') {
    url = configOrUrl.url || '';
    reqMethod = configOrUrl.method || 'GET';
    reqOptions = configOrUrl.options || {};
    reqIsUUrl = configOrUrl.isUUrl || 'c';
  } else {
    url = configOrUrl;
    reqMethod = method || 'GET';
    reqOptions = options || {};
    reqIsUUrl = isUUrl || 'c';
  }
  
	let baseURL = '';
	switch (reqIsUUrl) {
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

	const config: any = { ...reqOptions };
	config.url = baseURL;
	config.method = reqMethod.toLowerCase();

	const headers = config.headers || {};
	if (!headers.Cookie && !headers.cookie) {
		if (global.userInfo && global.userInfo.cookie) {
			headers.Cookie = global.userInfo.cookie;
		}
	}

	if (headers.cookies) {
		if (!headers.Cookie) headers.Cookie = headers.cookies;
		delete headers.cookies;
	}

	config.headers = headers;

	return service(config);
}

export default request;
