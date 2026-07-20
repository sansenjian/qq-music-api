import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';
import request from '../../util/request';
import * as config from '../config';

interface YCommonOptions {
	url: string;
	method?: Method | string;
	options?: AxiosRequestConfig;
	hasCommonParams?: boolean;
}

const PRIMARY_REFERER = 'https://c.y.qq.com/';
const FALLBACK_REFERER = 'https://y.qq.com';

/**
 * 构建一次请求的完整配置(headers、params、debug 日志)。
 * 抽出来便于失败后用不同 Referer 重试。
 */
function buildAxiosConfig(
	{ url, method = 'get', options = {}, hasCommonParams = true }: YCommonOptions,
	referer: string,
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
		host: 'c.y.qq.com',
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
	return { url, method: method as Method, options: opts };
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
		// HTML 错误页通常以 '<' 开头
		if (trimmed.startsWith('<')) return false;
		// 既不是 JSON 也不是 JSONP 包装
		const looksJson = trimmed.startsWith('{') || trimmed.startsWith('[');
		const looksJsonp = /^\w+\(/.test(trimmed);
		if (!looksJson && !looksJsonp) return false;
		return true;
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
	if (
		typeof err.code === 'string' &&
		(err.code === 'ERR_NETWORK' || /^(ECONN|ETIMEDOUT|ENOTFOUND|EAI|EADDR|EHOSTUNREACH|ENETUNREACH)/.test(err.code))
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
	// 第一次:用主 Referer (c.y.qq.com)
	let primaryError: unknown;
	try {
		const result = await request(buildAxiosConfig(yCommonOptions, PRIMARY_REFERER));
		if (looksValid(result?.data)) {
			return result;
		}
		// 数据看起来异常(可能是 Referer 校验失败返回空/HTML),触发重试
		if (process.env.DEBUG === 'true') {
			console.log(`[y_common] 主 Referer 响应异常,使用备用 Referer 重试: ${yCommonOptions.url}`);
		}
	} catch (error) {
		primaryError = error;
		if (isRetryableError(error)) {
			// 可重试的网络/服务端错误,用备用 Referer 重试
			if (process.env.DEBUG === 'true') {
				console.log(`[y_common] 主 Referer 请求失败(可重试),使用备用 Referer 重试: ${yCommonOptions.url}`, error);
			}
		} else {
			// 不可重试的错误(业务错误/普通 Error/4xx),直接抛出给上层
			throw error;
		}
	}

	// 第二次:用备用 Referer (y.qq.com) 重试
	try {
		return await request(buildAxiosConfig(yCommonOptions, FALLBACK_REFERER));
	} catch (fallbackError) {
		// 备用 Referer 也失败:优先抛出原始错误(更有诊断价值),无原始错误时抛备用错误
		throw primaryError ?? fallbackError;
	}
}
