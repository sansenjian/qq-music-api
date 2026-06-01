/**
 * API 响应基础结构
 */
export interface ApiResponseBody {
  response?: unknown;
  error?: unknown;
  message?: string;
  isOk?: boolean;
  refresh?: boolean;
  data?: unknown;
  [key: string]: unknown;
}

export interface ApiSuccessBody<TData = unknown> extends ApiResponseBody {
  response: TData;
}

export interface ApiErrorBody<TError = unknown> extends ApiResponseBody {
  error: TError;
}

export interface ApiDataBody<TData = unknown> extends ApiResponseBody {
  data: TData;
}

export interface ApiResponse<TBody extends ApiResponseBody = ApiResponseBody> {
  status: number;
  body: TBody;
}

/**
 * API 函数参数选项
 */
export interface ApiOptions<TParams extends Record<string, any> = Record<string, any>, TOption = any> {
  method?: string;
  params?: TParams;
  option?: TOption;
  isFormat?: boolean | string;
  [key: string]: any;
}

/**
 * API 函数类型定义
 */
export type ApiFunction<
  TOptions extends ApiOptions = ApiOptions,
  TBody extends ApiResponseBody = ApiResponseBody
> = (options: TOptions) => Promise<ApiResponse<TBody>>;
