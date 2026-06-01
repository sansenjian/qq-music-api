import type { Context } from 'koa';
import type { KoaContext, Controller } from '../routes/types';
import type { ApiResponse, ApiOptions, ApiResponseBody } from '../types/api';
import {
	logControllerFailure,
	logControllerStart,
	logControllerSuccess,
	startTimer,
} from '../util/observability';

export interface Validator<T = Record<string, unknown>> {
	(params: T): { valid: boolean; error?: string };
}

export interface ControllerOptions<T = Record<string, unknown>, TApiOptions extends ApiOptions = ApiOptions> {
	validator?: Validator<T>;
	buildApiOptions?: (ctx: KoaContext, params: T) => TApiOptions;
	errorMessage?: string;
	onError?: (ctx: KoaContext, error: unknown) => void;
	name?: string;
}

const INTERNAL_ERROR_MESSAGE = '服务器内部错误';
const UPSTREAM_ERROR_MESSAGE = '上游服务异常';

const setJsonResponse = (ctx: Context, status: number, body: unknown) => {
	ctx.status = status;
	ctx.type = 'application/json';
	ctx.body = body;
};

const isMissingRequiredValue = (value: unknown): boolean => {
	if (value === undefined || value === null) return true;
	if (typeof value === 'string') return value.trim() === '';
	return false;
};

export function createController<T extends ApiOptions>(
	apiFunction: (props: T) => Promise<ApiResponse>,
	options?: ControllerOptions<Record<string, unknown>, T>,
): Controller {
	return async (ctx: KoaContext, _next: () => Promise<void>) => {
		const controllerName = options?.name || apiFunction.name || 'anonymous';
		const duration = startTimer();
		logControllerStart(controllerName, ctx);

		try {
			const params = { ...ctx.query, ...ctx.params };

			if (options?.validator) {
				const validation = options.validator(params);
				if (!validation.valid) {
					setJsonResponse(ctx, 400, { response: validation.error || options.errorMessage || 'Invalid parameters' });
					return;
				}
			}

			const apiProps = options?.buildApiOptions
				? options.buildApiOptions(ctx, params)
				: ({
						method: 'get',
						params,
						option: {},
					} as T);

			const { status, body } = await apiFunction(apiProps);
			setJsonResponse(ctx, status, body);
			logControllerSuccess(controllerName, ctx, duration());
		} catch (error) {
			logControllerFailure(controllerName, error, duration());
			if (options?.onError) {
				options.onError(ctx, error);
			} else {
				setJsonResponse(ctx, 500, { error: INTERNAL_ERROR_MESSAGE });
			}
		}
	};
}

export function validateRequired(fields: string[]): Validator {
	return (params: Record<string, unknown>) => {
		const missingFields = fields.filter(field => isMissingRequiredValue(params[field]));
		if (missingFields.length > 0) {
			return { valid: false, error: `缺少必需参数：${missingFields.join(', ')}` };
		}
		return { valid: true };
	};
}

export function setApiResponse(ctx: Context, apiResponse: ApiResponse<ApiResponseBody>): void {
	setJsonResponse(ctx, apiResponse.status || 500, apiResponse.body);
}

export function withErrorHandler(
	handler: (ctx: KoaContext) => Promise<void>,
	name = handler.name || 'anonymous',
): (ctx: KoaContext, next: () => Promise<void>) => Promise<void> {
	return async (ctx: KoaContext, next: () => Promise<void>) => {
		const duration = startTimer();
		logControllerStart(name, ctx);

		try {
			await handler(ctx);
			logControllerSuccess(name, ctx, duration());
			await next();
		} catch (error) {
			logControllerFailure(name, error, duration());
			setJsonResponse(ctx, 502, { error: UPSTREAM_ERROR_MESSAGE });
		}
	};
}
