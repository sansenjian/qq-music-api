/**
 * 剥离 JSONP 包装并解析为对象。
 *
 * 兼容任意 callback 名(如 `MusicJsonCallback`、`jsonCallback`、`getPlaylist` 等),
 * 且支持 JSON 内容中包含嵌套括号或换行。
 *
 * 输入示例: `'MusicJsonCallback({"desc":"a(b)c","list":[1,2]})'`
 *
 * 解析策略(按顺序尝试):
 *  1. 已是对象/数组:直接返回。
 *  2. 字符串但不含 JSONP 包装:尝试 `JSON.parse`,失败则原样返回。
 *  3. 字符串含 JSONP 包装:用 `indexOf('(')` 与 `lastIndexOf(')')` 剥离外层包装后 `JSON.parse`。
 *     非正则方案天然支持嵌套括号。
 *  4. JSONP 内容解析失败:原样返回。
 *
 * 注:本函数修复了旧实现 `/^\w+\(([^()]+)\)$/` 在 JSON 内容含括号时匹配失败的问题。
 */
export function parseJsonp<T = unknown>(response: unknown): T {
	// 1. 已是对象/数组,直接返回(axios responseType:'json' 成功解析的情况)
	if (typeof response !== 'string') {
		return response as T;
	}

	const text = response.trim();

	// 2. 先尝试纯 JSON，避免 JSON 字符串内容中的括号被误判为 JSONP。
	try {
		return JSON.parse(text) as T;
	} catch {
		// 继续尝试 JSONP 包装。
	}

	// 3. 不含 JSONP 包装时,保留原始字符串
	const start = text.indexOf('(');
	const end = text.lastIndexOf(')');
	if (start === -1 || end <= start) {
		return response as T;
	}

	// 4. 非正则方案(首选):找第一个 '(' 与最后一个 ')',中间切片后 JSON.parse
	const jsonStr = text.slice(start + 1, end);
	try {
		return JSON.parse(jsonStr) as T;
	} catch {
		return response as T;
	}
}
