/**
 * API 响应基础结构
 */
export interface ApiResponse {
  status: number;
  body: {
    response?: any;
    error?: any;
    message?: string;
    isOk?: boolean;
    refresh?: boolean;
    data?: any;
    [key: string]: any;
  };
}

/**
 * API 函数参数选项
 */
export interface ApiOptions {
  method?: string;
  params?: Record<string, any>;
  option?: any;
  isFormat?: boolean | string;
  [key: string]: any;
}

export interface HandleApiOptions<TInput = any, TOutput = any> {
  /** 成功时的数据转换函数 */
  transformData?: (data: TInput) => TOutput;
  /** 自定义状态码 */
  customStatus?: number;
  /** 是否记录错误日志 */
  logError?: boolean;
}

/**
 * API 函数类型定义
 */
export type ApiFunction<T extends ApiOptions = ApiOptions> = (
  options: T
) => Promise<ApiResponse>;

/**
 * 成功响应创建器
 */
export function createSuccessResponse(
  data: any,
  status: number = 200
): ApiResponse {
  return {
    status,
    body: {
      response: data,
    },
  };
}

/**
 * 错误响应创建器
 */
export function createErrorResponse(
  error: any,
  status: number = 500
): ApiResponse {
  return {
    status,
    body: {
      error,
    },
  };
}

/**
 * API Promise 处理器 - 自动处理成功和错误情况
 */
export async function handleApi<TInput = any, TOutput = TInput>(
  promise: Promise<TInput>,
  options?: HandleApiOptions<TInput, TOutput>
): Promise<ApiResponse> {
  try {
    const result = await promise;
    const responseData = options?.transformData
      ? options.transformData((result as any).data || result)
      : (result as any).data || result;

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
