/**
 * 解析 QQ 音乐分享链接,提取歌单 disstid 或字母 MID。
 *
 * 支持的链接格式:
 *  1. https://i2.y.qq.com/n3/other/pages/details/playlist.html?platform=11&appshare=android_qq&appversion=20040008&hosteuin=oKElNKviowv57n**&id=2029866739&ADTAG=qfshare
 *     → 提取 query 参数 `id`(数字 disstid)
 *  2. https://y.qq.com/n/ryqq/playlist/2029866739
 *     → 提取路径最后一段(数字 disstid)
 *  3. https://y.qq.com/n/ryqq/playlist/CBOE******  (字母 MID 形式)
 *     → 提取字母 MID(本接口目前只返回 mid,不解析;调用方需自行处理)
 *  4. https://c.y.qq.com/...?disstid=2029866739
 *     → 提取 query 参数 `disstid`
 *
 * 也支持不带 http(s) 的纯 URL,以及被文本包围的 URL(自动定位第一个 `://` 或 `y.qq.com` 起点)。
 */

export interface ParsedShareUrl {
	/** 原始输入(已 trim) */
	raw: string;
	/** 识别到的资源类型 */
	type: 'songlist' | 'unknown';
	/** 数字 disstid(若 type=songlist 且为数字形式) */
	disstid?: string;
	/** 字母 MID(若 type=songlist 且为字母形式,如 CBOxxx) */
	mid?: string;
	/** 解析失败时的原因 */
	error?: string;
}

/**
 * 判断一个字符串是否为数字形式(纯数字,允许前导 0)。
 */
function isNumericId(s: string): boolean {
	return /^\d+$/.test(s);
}

/**
 * 判断一个字符串是否为 QQ 音乐字母 MID(通常以字母开头,长度 10+ 字符,不含空格/斜杠)。
 * 例:`CBOEFGHI123`、`002MAeob3zLXwZ`
 */
function isAlphaMid(s: string): boolean {
	return /^[A-Za-z0-9]{10,}$/.test(s) && /[A-Za-z]/.test(s);
}

/**
 * 从文本中提取第一个看起来像 URL 的片段。
 * 兼容被普通文字包围的链接(如聊天消息)。
 */
function extractUrl(input: string): string {
	const trimmed = input.trim();
	const trimUrlPunctuation = (value: string) =>
		value.replace(/[.,!?;:)\]}"'><《》【】）“”‘’\uFF0C\u3002\uFF01\uFF1F\uFF1B\uFF1A]+$/u, '');

	// 优先匹配 http(s)://
	const httpMatch = trimmed.match(/https?:\/\/[^\s\u4e00-\u9fa5]+/i);
	if (httpMatch) return trimUrlPunctuation(httpMatch[0]);

	// 其次匹配形如 y.qq.com/... 或 c.y.qq.com/... 的裸域名 URL
	const bareMatch = trimmed.match(/(?:[a-z0-9-]+\.)?y\.qq\.com\/[^\s\u4e00-\u9fa5]+/i);
	if (bareMatch) return trimUrlPunctuation(bareMatch[0]);

	return trimmed;
}

/**
 * 解析 URL 的 query 参数。兼容 URL 对象无法解析的裸字符串。
 */
function parseQueryParams(url: string): Record<string, string> {
	const params: Record<string, string> = {};
	try {
		const u = new URL(url);
		u.searchParams.forEach((value, key) => {
			params[key] = value;
		});
		return params;
	} catch {
		// URL 构造失败(裸域名),手动提取 query
		const qIndex = url.indexOf('?');
		if (qIndex === -1) return params;
		const query = url.slice(qIndex + 1).split('#')[0];
		for (const pair of query.split('&')) {
			if (!pair) continue;
			const eq = pair.indexOf('=');
			if (eq === -1) {
				params[pair] = '';
			} else {
				const decode = (value: string) => {
					try {
						return decodeURIComponent(value);
					} catch {
						return value;
					}
				};
				params[decode(pair.slice(0, eq))] = decode(pair.slice(eq + 1));
			}
		}
		return params;
	}
}

/**
 * 从 URL 路径中提取最后一段作为 ID 候选。
 */
function getLastPathSegment(url: string): string | undefined {
	try {
		const u = new URL(url);
		const segs = u.pathname.split('/').filter(Boolean);
		return segs.length > 0 ? segs[segs.length - 1] : undefined;
	} catch {
		return undefined;
	}
}

const isSupportedHost = (url: string): boolean => {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
		const hostname = parsed.hostname.toLowerCase();
		return hostname === 'y.qq.com' || hostname.endsWith('.y.qq.com');
	} catch {
		return false;
	}
};

const hasPlaylistShape = (url: string, params: Record<string, string>): boolean => {
	if (params.disstid) return true;
	try {
		const parsed = new URL(url);
		return /(?:^|\/)playlist(?:$|\/|\.html$)/i.test(parsed.pathname);
	} catch {
		return false;
	}
};

/**
 * 解析分享链接。
 *
 * @param input 用户输入的分享链接(可以是完整 URL、裸域名 URL、或被文字包围的 URL)
 * @returns 解析结果。失败时 type='unknown' 且带 error 字段。
 */
export function parseShareUrl(input: string): ParsedShareUrl {
	if (!input || typeof input !== 'string') {
		return { raw: '', type: 'unknown', error: '输入为空' };
	}

	const raw = input.trim();
	const explicitScheme = raw.match(/^([a-z][a-z\d+.-]*):\/\//i)?.[1].toLowerCase();
	if (explicitScheme && explicitScheme !== 'http' && explicitScheme !== 'https') {
		return { raw, type: 'unknown', error: '仅支持 HTTP(S) QQ 音乐分享链接' };
	}
	const extractedUrl = extractUrl(raw);
	const url = /^[a-z][a-z\d+.-]*:\/\//i.test(extractedUrl) ? extractedUrl : `https://${extractedUrl}`;

	if (!isSupportedHost(url)) {
		return { raw, type: 'unknown', error: '仅支持 QQ 音乐分享链接' };
	}

	const params = parseQueryParams(url);
	const playlistShape = hasPlaylistShape(url, params);

	// 策略 1:从 query 参数提取(`id` 或 `disstid`)
	const idFromQuery = params.id || params.disstid || params.playlistId;
	if (idFromQuery && playlistShape) {
		if (isNumericId(idFromQuery)) {
			return { raw, type: 'songlist', disstid: idFromQuery };
		}
		if (isAlphaMid(idFromQuery)) {
			return { raw, type: 'songlist', mid: idFromQuery };
		}
	}

	// 策略 2:从路径最后一段提取(如 /n/ryqq/playlist/<id>)
	const lastSeg = getLastPathSegment(url);
	if (lastSeg && playlistShape) {
		if (isNumericId(lastSeg)) {
			return { raw, type: 'songlist', disstid: lastSeg };
		}
		if (isAlphaMid(lastSeg)) {
			return { raw, type: 'songlist', mid: lastSeg };
		}
	}

	// 策略 3:链接中包含 playlist 字样但未提取到 ID
	if (playlistShape || /playlist/i.test(url) || /diss/i.test(url)) {
		return { raw, type: 'unknown', error: '识别到歌单链接但无法提取 ID' };
	}

	return { raw, type: 'unknown', error: '无法识别的分享链接格式' };
}
