import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import http from 'http';
import https from 'https';
import colors from './colors';

const service = axios.create({
	withCredentials: true,
	timeout: 15000,
	responseType: 'json',
	httpAgent: new http.Agent({ keepAlive: true }),
	httpsAgent: new https.Agent({ keepAlive: true }),
});

const ensureContentType = (config: AxiosRequestConfig) => {
	const method = (config.method || 'get').toLowerCase();
	const hasBody = config.data !== undefined && config.data !== null;
	const headers = config.headers || {};
	const hasContentType = Boolean(headers['Content-Type'] || headers['content-type']);

	if (hasBody && !hasContentType && ['post', 'put', 'patch', 'delete'].includes(method)) {
		headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
	}

	config.headers = headers;
};

service.interceptors.request.use(
	config => {
		if (config.headers && !config.headers['User-Agent']) {
			config.headers['User-Agent'] =
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
		}
		ensureContentType(config);
		return config;
	},
	error => Promise.reject(error),
);

service.interceptors.response.use(
	response => {
		if (!response) throw Error('response is null');
		if (process.env.DEBUG === 'true') {
			console.log(colors.info(`${response.config.url} request success`));
		}
		return response;
	},
	error => {
		const url = error.config ? error.config.url : 'Unknown URL';
		console.log(colors.error(`${url} request error: ${error.message}`));
		return Promise.reject(error);
	},
);

const yURL = 'https://y.qq.com';
const cURL = 'https://c.y.qq.com';
const iURL = 'https://i.y.qq.com';

export type RequestBaseUrl = 'c' | 'y' | 'u' | 'i';

export interface RequestConfig {
	url?: string;
	method?: Method | Lowercase<Method>;
	options?: AxiosRequestConfig;
	isUUrl?: RequestBaseUrl;
	headers?: Record<string, string>;
	cookie?: string;
}

const BASE_URL_MAP: Record<string, string> = {
	y: yURL,
	c: cURL,
	i: iURL,
};

function request<TResponse = any>(config: RequestConfig): Promise<AxiosResponse<TResponse>> {
	const url = config.url || '';
	const reqMethod = (config.method || 'GET').toLowerCase() as Method;
	const baseURL = config.isUUrl === 'u' ? url : (BASE_URL_MAP[config.isUUrl || 'c'] || cURL) + url;

	const axiosConfig: AxiosRequestConfig = {
		...config.options,
		url: baseURL,
		method: reqMethod,
	};

	const headers = axiosConfig.headers || {};

	if ((headers as any).cookies) {
		if (!headers.Cookie) headers.Cookie = (headers as any).cookies;
		delete (headers as any).cookies;
	}

	if (!headers.Cookie && (headers as any).cookie) {
		headers.Cookie = (headers as any).cookie;
		delete (headers as any).cookie;
	}

	if (!headers.Cookie && config.cookie) {
		headers.Cookie = config.cookie;
	}

	axiosConfig.headers = headers;

	return service<TResponse>(axiosConfig);
}

export default request;
