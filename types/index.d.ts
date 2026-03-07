import type { UserInfo } from './global';

declare global {
	var userInfo: UserInfo;
}

// 导出 UserInfo 类型供其他模块使用
export type { UserInfo };

declare module 'koa' {
	interface Context {
		request: Request & {
			body?: any;
			rawBody?: string;
		};
		response: Response;
		req: any;
		res: any;
		app: Application;
		cookies: {
			get: (name: string) => string | undefined;
			set: (name: string, value: string, options?: any) => void;
		};
		query: Record<string, any>;
		params: Record<string, string>;
		path: string;
		url: string;
		method: string;
		headers: Record<string, string>;
		status: number;
		body: any;
		get: (field: string) => string;
		set: (field: string, value: string) => void;
	}

	interface Request {
		header: Record<string, string>;
		headers: Record<string, string>;
		method: string;
		url: string;
		path: string;
		query: Record<string, any>;
		body?: any;
		rawBody?: string;
	}

	interface Response {
		status: number;
		body: any;
		headers: Record<string, string>;
		get: (field: string) => string;
		set: (field: string, value: string) => void;
	}

	interface Application {
		use: (middleware: any) => this;
		listen: (port: number, callback?: () => void) => any;
	}

	type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

	export class Koa {
		constructor();
		use(fn: Middleware): this;
		listen(port: number, hostname?: string, backlog?: number, listeningListener?: () => void): any;
	}

	export default Koa;
	export { Context, Request, Response, Middleware };
}

declare module 'koa-bodyparser' {
	function bodyParser(options?: any): any;
	export = bodyParser;
}

declare module 'koa-static' {
	function serve(root: string, opts?: any): any;
	export = serve;
}

declare module '@koa/router' {
	class Router {
		constructor(opts?: any);
		get(path: string, ...middleware: any[]): this;
		post(path: string, ...middleware: any[]): this;
		use(...middleware: any[]): this;
		routes(): any;
		allowedMethods(): any;
	}
	export = Router;
}

declare module 'koa-cors' {
	function cors(options?: any): any;
	export = cors;
}
