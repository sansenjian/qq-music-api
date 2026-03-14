import axios, { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
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

export type RequestBaseUrl = 'c' | 'y' | 'u';

export interface RequestConfig<TOptions extends AxiosRequestConfig = AxiosRequestConfig> {
	url?: string;
	method?: Method | Lowercase<Method>;
	options?: TOptions;
	isUUrl?: RequestBaseUrl;
	headers?: Record<string, string>;
	/** 鎵嬪姩浼犻€掔殑 Cookie锛堜紭鍏堢骇楂樹簬鍏ㄥ眬 Cookie锛?*/
	cookie?: string;
}

function request<TResponse = any, TOptions extends AxiosRequestConfig = AxiosRequestConfig>(
	configOrUrl: string | RequestConfig<TOptions>,
	method?: Method | Lowercase<Method>,
	options?: TOptions,
	isUUrl?: RequestBaseUrl,
	customCookie?: string
): Promise<AxiosResponse<TResponse>> {
	let url: string;
	let reqMethod: Method | Lowercase<Method>;
	let reqOptions: TOptions | undefined;
	let reqIsUUrl: RequestBaseUrl;
	let reqCookie: string | undefined;

	if (typeof configOrUrl === 'object') {
		url = configOrUrl.url || '';
		reqMethod = configOrUrl.method || 'GET';
		reqOptions = configOrUrl.options;
		reqIsUUrl = configOrUrl.isUUrl || 'c';
		reqCookie = configOrUrl.cookie;
	} else {
		url = configOrUrl;
		reqMethod = method || 'GET';
		reqOptions = options;
		reqIsUUrl = isUUrl || 'c';
		// 浣跨敤鑷畾涔?Cookie锛堝鏋滄彁渚涳級
		reqCookie = customCookie;
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

	const config: AxiosRequestConfig = {
		...(reqOptions || {}),
		url: baseURL,
		method: reqMethod.toLowerCase() as Method
	};

	const headers = config.headers || {};
	if ((headers as any).cookies) {
		if (!(headers as any).Cookie) {
			(headers as any).Cookie = (headers as any).cookies;
		}
		delete (headers as any).cookies;
	}

	// Cookie 浼樺厛绾э細鎵嬪姩浼犻€?> 鍏ㄥ眬 Cookie锛堝鏋滃惎鐢級
	if (!(headers as any).Cookie && (headers as any).cookie) {
		(headers as any).Cookie = (headers as any).cookie;
	}
	if ((headers as any).cookie) {
		delete (headers as any).cookie;
	}
	if (!(headers as any).Cookie && reqCookie) {
		(headers as any).Cookie = reqCookie;
	}

	config.headers = headers;

	return service<TResponse>(config);
}

export default request;


