import type { ApiResponse } from '../types/api';

/**
 * 创建成功的 API 响应
 * @param data 响应数据
 * @param status HTTP 状态码，默认 200
 */
export function successResponse(data: any, status: number = 200): ApiResponse {
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
export function errorResponse(error: any, status: number = 500): ApiResponse {
  return {
    status,
    body: {
      error,
    },
  };
}

/**
 * 处理 API Promise，自动包装成功和错误响应
 * @param promise API 请求 Promise
 * @param options 可选配置
 */
export async function handleApi<T = any>(
  promise: Promise<T>,
  options?: {
    /** 成功时的数据转换函数 */
    transformData?: (data: T) => any;
    /** 自定义状态码 */
    customStatus?: number;
    /** 是否记录错误日志 */
    logError?: boolean;
  }
): Promise<ApiResponse> {
  try {
    const result = await promise;
    const resultAny = result as any;
    const responseData = options?.transformData
      ? options.transformData(resultAny.data || result)
      : resultAny.data || result;

    return {
      status: options?.customStatus || 200,
      body: {
        response: responseData,
      },
    };
  } catch (error) {
    if (options?.logError !== false) {
      console.log('API error:', error);
    }

    return {
      status: options?.customStatus || 500,
      body: {
        error,
      },
    };
  }
}

/**
 * 创建自定义结构的响应
 * @param body 响应体
 * @param status HTTP 状态码
 */
export function customResponse(body: any, status: number = 200): ApiResponse {
  return {
    status,
    body,
  };
}

/**
 * 处理 400 错误响应（参数错误）
 * @param message 错误消息
 */
export function badRequest(message: string): ApiResponse {
  return {
    status: 400,
    body: {
      response: message,
    },
  };
}
