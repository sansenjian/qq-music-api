import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import request from '../../util/request';
import { parseJsonp } from '../../util/parseJsonp';
import * as config from '../config';

/**
 * u.y.qq.com 统一接口网关(musicu.fcg)映射。
 * 仅对验证过网关可用性的接口配置;网关请求格式与 fcgi-bin 不同,
 * 需要把 fcgi 请求参数映射为网关 module/method/param,并把网关响应
 * 归一化为 fcgi 风格({ code, data })以便上层无感。
 */
export interface YCommonGateway {
	module: string;
	method: string;
	/** 由 fcgi 请求 params 构建网关 param */
	buildParam: (params: Record<string, unknown>) => Record<string, unknown>;
	/** 网关原始响应 → fcgi 风格响应 data */
	normalize: (upstream: Record<string, any>) => unknown;
}

interface YCommonOptions {
	url: string;
	method?: Method | string;
	options?: AxiosRequestConfig;
	hasCommonParams?: boolean;
	gateway?: YCommonGateway;
}

const PRIMARY_REFERER = 'https://c.y.qq.com/';
const FALLBACK_REFERER = 'https://y.qq.com';

/** c.y.qq.com 网页 API 的备用镜像域名(同路径 fcgi-bin 接口,实测数据一致)。 */
const FALLBACK_HOST = 'i.y.qq.com';

const MUSICU_URL = 'https://u.y.qq.com/cgi-bin/musicu.fcg';

type YCommonBase = 'c' | 'i';

/**
 * 通过 u.y.qq.com 统一接口网关(musicu.fcg)重试。
 * 网关请求为 POST JSON({ comm, req_0 }),失败或业务码非 0 时抛出
 * ERR_GATEWAY,由外层尝试链继续降级。
 */
async function requestGateway(yCommonOptions: YCommonOptions, gateway: YCommonGateway): Promise<AxiosResponse> {
	const params = (yCommonOptions.options?.params || {}) as Record<string, unknown>;
	const payload = {
		comm: { uin: 0, format: 'json', ct: 24, cv: 0 },
		req_0: {
			module: gateway.module,
			method: gateway.method,
			param: gateway.buildParam(params),
		},
	};

	const response = await request({
		url: MUSICU_URL,
		method: 'POST',
		isUUrl: 'u',
		options: {
			headers: { 'Content-Type': 'application/json', Referer: 'https://y.qq.com/' },
			data: JSON.stringify(payload),
		},
	});

	const upstream = (response?.data || {}) as Record<string, any>;
	const reqData = upstream?.req_0 as Record<string, any> | undefined;
	if (!reqData || Number(reqData.code) !== 0) {
		throw Object.assign(new Error(`u.y.qq.com gateway failed: ${yCommonOptions.url}`), { code: 'ERR_GATEWAY' });
	}

	return { ...response, data: gateway.normalize(upstream) };
}

/**
 * 构建一次请求的完整配置(headers、params、debug 日志)。
 * 抽出来便于失败后用不同 Referer / 镜像域名重试。
 */
function buildAxiosConfig(
	{ url, method = 'get', options = {}, hasCommonParams = true }: YCommonOptions,
	referer: string,
	base: YCommonBase = 'c',
) {
	const opts: AxiosRequestConfig = { ...options };

	// Merge commonParams into params
	// commonParams acts as defaults, specific params override them
	if (hasCommonParams) {
		opts.params = { ...config.getCommonParams(), ...opts.params };
	} else {
		opts.params = { ...opts.params };
	}

	opts.headers = {
		referer: referer,
		host: base === 'i' ? FALLBACK_HOST : 'c.y.qq.com',
		...opts.headers,
	};

	if (process.env.DEBUG === 'true') {
		const logOpts = { ...opts, headers: { ...opts.headers } };
		const SENSITIVE_HEADER_KEYS = ['cookie', 'authorization', 'proxy-authorization'];

		if (logOpts.headers) {
			Object.keys(logOpts.headers).forEach(key => {
				if (SENSITIVE_HEADER_KEYS.includes(key.toLowerCase())) {
					(logOpts.headers as any)[key] = '[masked]';
				}
			});
		}

		console.log(url, { opts: logOpts });
	}
	return { url, method: method as Method, options: opts, isUUrl: base };
}

/**
 * 判断响应是否"看起来正常"。
 *
 * 用于决定是否需要用备用 Referer 重试。Referer 校验失败时,
 * QQ 音乐接口通常返回空响应体、HTML 错误页或非预期字符串。
 *
 * 判定条件(满足任一即视为异常,触发重试):
 *  - 响应为 null / undefined / 空字符串
 *  - 响应为字符串且既不是 JSON 也不是 JSONP(以 '<' 开头通常是 HTML 错误页)
 *  - 响应为普通对象但为空(无任何可用的键)；数组(包括空数组)是合法数据
 */
function looksValid(response: unknown): boolean {
	if (response === null || response === undefined) return false;

	if (typeof response === 'string') {
		const trimmed = response.trim();
		if (trimmed === '') return false;
		if (trimmed.startsWith('<')) return false;
		const parsed = parseJsonp(response);
		if (parsed === response) return false;
		return parsed === null || typeof parsed === 'object' ? looksValid(parsed) : true;
	}

	if (typeof response === 'object') {
		if (Array.isArray(response)) return true;
		// 空对象(可能是上游返回 {} 表示错误)
		return Object.keys(response as Record<string, unknown>).length > 0;
	}

	return true;
}

/**
 * 判断错误是否"可重试"(网络层错误或 5xx)。
 *
 * 用于决定 reject 时是否用备用 Referer 重试。
 * Referer 校验失败通常表现为 HTTP 200 + 空响应/HTML,
 * 而非 reject;因此 reject 仅在真正的网络/服务端错误时重试。
 *
 * 不重试的情况(直接抛出给上层处理):
 *  - 普通 Error(无 code、无 response,如业务层主动抛错或 mock 抛错)
 *  - 4xx 客户端错误(请求参数问题,换 Referer 无意义)
 */
function isRetryableError(error: unknown): boolean {
	if (!error || typeof error !== 'object') return false;
	const err = error as Record<string, unknown>;

	// 网络层错误:Axios ERR_NETWORK、ECONNRESET、ETIMEDOUT、ENOTFOUND、EAI_AGAIN 等
	// ERR_GATEWAY:u.y.qq.com 网关业务码非 0,可降级到镜像域名重试
	if (
		typeof err.code === 'string' &&
		(err.code === 'ERR_NETWORK' ||
			err.code === 'ERR_GATEWAY' ||
			/^(ECONN|ETIMEDOUT|ENOTFOUND|EAI|EADDR|EHOSTUNREACH|ENETUNREACH)/.test(err.code))
	) {
		return true;
	}

	// HTTP 5xx 服务端错误(包含 429 Too Many Requests)
	const response = err.response as { status?: number } | undefined;
	if (response && typeof response.status === 'number') {
		return response.status >= 500 || response.status === 429;
	}

	return false;
}

export default async function y_common(yCommonOptions: YCommonOptions): Promise<AxiosResponse> {
	type Attempt =
		| { kind: 'fcgi'; label: string; referer: string; base: YCommonBase }
		| { kind: 'gateway'; label: string; gateway: YCommonGateway };

	const attempts: Attempt[] = [
		{ kind: 'fcgi', label: `主 Referer (${PRIMARY_REFERER})`, referer: PRIMARY_REFERER, base: 'c' },
		{ kind: 'fcgi', label: `备用 Referer (${FALLBACK_REFERER})`, referer: FALLBACK_REFERER, base: 'c' },
	];

	if (yCommonOptions.gateway) {
		attempts.push({
			kind: 'gateway',
			label: `u.y.qq.com 网关 (${yCommonOptions.gateway.module})`,
			gateway: yCommonOptions.gateway,
		});
	}

	attempts.push({ kind: 'fcgi', label: `镜像域名 (${FALLBACK_HOST})`, referer: FALLBACK_REFERER, base: 'i' });

	let lastError: unknown;

	for (const attempt of attempts) {
		try {
			const result =
				attempt.kind === 'gateway'
					? await requestGateway(yCommonOptions, attempt.gateway)
					: await request(buildAxiosConfig(yCommonOptions, attempt.referer, attempt.base));
			if (looksValid(result?.data)) {
				return result;
			}
			// 数据看起来异常(可能是 Referer 校验失败返回空/HTML),尝试下一层
			if (process.env.DEBUG === 'true') {
				console.log(`[y_common] ${attempt.label} 响应异常,尝试下一层: ${yCommonOptions.url}`);
			}
		} catch (error) {
			if (!isRetryableError(error)) {
				// 不可重试的错误(业务错误/普通 Error/4xx):优先抛出原始错误(更有诊断价值)
				throw lastError ?? error;
			}
			lastError = error;
			if (process.env.DEBUG === 'true') {
				console.log(`[y_common] ${attempt.label} 请求失败(可重试),尝试下一层: ${yCommonOptions.url}`, error);
			}
		}
	}

	throw lastError ?? new Error(`y_common: 所有请求尝试均失败: ${yCommonOptions.url}`);
}
