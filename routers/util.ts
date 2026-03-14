import type { KoaContext, Controller } from './types';
import type { ApiResponse, ApiOptions } from '../types/api';

/**
 * Controller 验证器类型
 */
export interface Validator<T = any> {
  (params: T): { valid: boolean; error?: string };
}

/**
 * Controller 配置选项
 */
export interface ControllerOptions<T = any> {
  /** 参数验证器 */
  validator?: Validator<T>;
  /** 错误消息 */
  errorMessage?: string;
  /** 自定义错误处理 */
  onError?: (ctx: KoaContext, error: any) => void;
}

const INTERNAL_ERROR_MESSAGE = '服务器内部错误';

const normalizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return INTERNAL_ERROR_MESSAGE;
};

const setInternalErrorResponse = (ctx: KoaContext, error: unknown) => {
  console.error('Controller error:', error);
  ctx.status = 500;
  ctx.body = {
    error: INTERNAL_ERROR_MESSAGE,
  };
};

const isMissingRequiredValue = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'string') {
    return value.trim() === '';
  }

  return false;
};

/**
 * 创建 Controller 的工厂函数
 * @param apiFunction API 函数
 * @param options 配置选项
 * @example
 * export default createController(
 *   require('../../module').getSingerDesc,
 *   {
 *     validator: (params) => {
 *       if (!params.singermid) {
 *         return { valid: false, error: '缺少 singermid 参数' };
 *       }
 *       return { valid: true };
 *     },
 *     errorMessage: 'no singermid'
 *   }
 * );
 */
export function createController<T extends ApiOptions>(
  apiFunction: (props: T) => Promise<ApiResponse>,
  options?: ControllerOptions<T>
): Controller {
  return async (ctx: KoaContext, next: () => Promise<void>) => {
    try {
      // 从 query 和 params 中提取参数
      const params = {
        ...ctx.query,
        ...ctx.params,
      } as any;

      // 验证参数
      if (options?.validator) {
        const validation = options.validator(params);
        if (!validation.valid) {
          ctx.status = 400;
          ctx.body = {
            response: validation.error || options.errorMessage || 'Invalid parameters',
          };
          return;
        }
      }

      // 构建 API 调用参数
      const apiProps: T = {
        method: 'get',
        params,
        option: {},
      } as T;

      // 调用 API
      const { status, body } = await apiFunction(apiProps);

      // 设置响应
      Object.assign(ctx, { status, body });
    } catch (error) {
      if (options?.onError) {
        options.onError(ctx, error);
      } else {
        setInternalErrorResponse(ctx, error);
      }
    }
  };
}

/**
 * 创建需要 POST 数据的 Controller
 * @param apiFunction API 函数
 * @param options 配置选项
 */
export function createPostController<T extends ApiOptions>(
  apiFunction: (props: T) => Promise<ApiResponse>,
  options?: ControllerOptions<T>
): Controller {
  return async (ctx: KoaContext, next: () => Promise<void>) => {
    try {
      // 从 request.body 中提取参数
      const params = ctx.request.body || {};

      // 验证参数
      if (options?.validator) {
        const validation = options.validator(params);
        if (!validation.valid) {
          ctx.status = 400;
          ctx.body = {
            response: validation.error || options.errorMessage || 'Invalid parameters',
          };
          return;
        }
      }

      // 构建 API 调用参数
      const apiProps: T = {
        method: 'post',
        params,
        option: {},
      } as T;

      // 调用 API
      const { status, body } = await apiFunction(apiProps);

      // 设置响应
      Object.assign(ctx, { status, body });
    } catch (error) {
      if (options?.onError) {
        options.onError(ctx, error);
      } else {
        setInternalErrorResponse(ctx, error);
      }
    }
  };
}

/**
 * 简单的参数验证器
 * @param requiredFields 必需的字段列表
 * @example
 * validator: validateRequired(['singermid', 'songmid'])
 */
export function validateRequired(fields: string[]): Validator {
  return (params: any) => {
    const missingFields = fields.filter(field => isMissingRequiredValue(params[field]));

    if (missingFields.length > 0) {
      return {
        valid: false,
        error: `缺少必需参数：${missingFields.join(', ')}`,
      };
    }

    return { valid: true };
  };
}

/**
 * 处理 Controller 响应
 * @param ctx Koa Context
 * @param apiCall API 调用函数
 */
export async function handleControllerResponse(
  ctx: KoaContext,
  apiCall: () => Promise<ApiResponse>
): Promise<void> {
  try {
    const { status, body } = await apiCall();
    Object.assign(ctx, { status, body });
  } catch (error) {
    console.error('Controller response error:', normalizeErrorMessage(error));
    ctx.status = 500;
    ctx.body = { error: INTERNAL_ERROR_MESSAGE };
  }
}

/**
 * 创建带自定义参数处理的 Controller
 * @param handler 自定义处理函数
 * @param apiFunction API 函数
 */
export function createCustomController<T extends ApiOptions>(
  handler: (ctx: KoaContext) => Partial<T>,
  apiFunction: (props: T) => Promise<ApiResponse>
): Controller {
  return async (ctx: KoaContext, next: () => Promise<void>) => {
    try {
      const customParams = handler(ctx);
      const apiProps: T = {
        method: 'get',
        option: {},
        ...customParams,
      } as T;

      const { status, body } = await apiFunction(apiProps);
      Object.assign(ctx, { status, body });
    } catch (error) {
      console.error('Custom controller error:', normalizeErrorMessage(error));
      ctx.status = 500;
      ctx.body = { error: INTERNAL_ERROR_MESSAGE };
    }
  };
}

/**
 * 统一处理 API 响应并设置到 Koa 上下文
 * @param ctx - Koa 上下文
 * @param apiResponse - API 响应对象
 */
export function setApiResponse(ctx: KoaContext, apiResponse: ApiResponse): void {
  ctx.status = apiResponse.status || 500;
  ctx.body = apiResponse.body;
}

/**
 * 包装异步控制器，自动处理错误
 * @param handler - 控制器处理函数
 * @returns 包装后的控制器
 */
export function withErrorHandler(
  handler: (ctx: KoaContext) => Promise<void>
): (ctx: KoaContext, next: () => Promise<void>) => Promise<void> {
  return async (ctx: KoaContext, next: () => Promise<void>) => {
    try {
      await handler(ctx);
      await next();
    } catch (error) {
      console.error('Controller error:', error);
      ctx.status = 502;
      ctx.body = {
        error: (error as Error).message || '服务器内部错误',
      };
    }
  };
}
