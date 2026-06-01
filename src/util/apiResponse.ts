import type { ApiErrorBody, ApiResponse, ApiResponseBody, ApiSuccessBody } from '../types/api';

const INTERNAL_ERROR_MESSAGE = '服务器内部错误';

/**
 * 创建成功的 API 响应
 * @param data 响应数据
 * @param status HTTP 状态码，默认 200
 */
export function successResponse<TData = unknown>(data: TData, status: number = 200): ApiResponse<ApiSuccessBody<TData>> {
	return {
		status,
		body: {
			response: data,
		},
	};
}

/**
 * 创建错误的 API 响应
 * @param error 错误信息
 * @param status HTTP 状态码，默认 500
 */
export function errorResponse<TError = unknown>(
	error: TError,
	status: number = 500,
): ApiResponse<ApiErrorBody<TError | string>> {
	return {
		status,
		body: {
			error: status >= 500 && error instanceof Error ? INTERNAL_ERROR_MESSAGE : error,
		},
	};
}

/**
 * 处理 API Promise，自动包装成功和错误响应
 * @param promise API 请求 Promise
 * @param options 可选配置
 */
export async function handleApi<T = unknown, TData = unknown>(
	promise: Promise<T>,
	options?: {
		/** 成功时的数据转换函数 */
		transformData?: (data: T) => TData;
		/** 自定义状态码 */
		customStatus?: number;
		/** 是否记录错误日志 */
		logError?: boolean;
	},
): Promise<ApiResponse<ApiSuccessBody<TData | T> | ApiErrorBody<string>>> {
	try {
		const result = await promise;
		const resultAny = result as any;
		const hasDataProperty = resultAny && typeof resultAny === 'object' && Object.prototype.hasOwnProperty.call(resultAny, 'data');
		const rawData = hasDataProperty ? resultAny.data : result;
		const responseData = options?.transformData ? options.transformData(rawData) : rawData;

		return {
			status: options?.customStatus || 200,
			body: {
				response: responseData,
			},
		};
	} catch (error) {
		// 只在非测试环境下记录错误日志
		if (options?.logError !== false && process.env.NODE_ENV !== 'test') {
			console.log('API error:', error);
		}

		return {
			status: options?.customStatus || 500,
			body: {
				error: INTERNAL_ERROR_MESSAGE,
			},
		};
	}
}

/**
 * 创建自定义结构的响应
 * @param body 响应体
 * @param status HTTP 状态码
 */
export function customResponse<TBody extends ApiResponseBody = ApiResponseBody>(
	body: TBody,
	status: number = 200,
): ApiResponse<TBody> {
	return {
		status,
		body,
	};
}

/**
 * 处理 400 错误响应（参数错误）
 * @param message 错误消息
 */
export function badRequest(message: string): ApiResponse<ApiSuccessBody<string>> {
	return {
		status: 400,
		body: {
			response: message,
		},
	};
}
