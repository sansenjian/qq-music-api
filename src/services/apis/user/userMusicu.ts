import { createHash } from 'node:crypto';
import type { Method } from 'axios';
import { getUserInfo, getUserUin } from '../../../config/user-info-store';
import { extractCookieValue, extractUinFromCookie } from '../../../util/cookieResolver';
import { getGtk } from '../../../util/loginUtils';
import { handleApi } from '../../../util/apiResponse';
import request from '../../../util/request';
import type { ApiResponse } from '../../../types/api';

const PART_1_INDEXES = [23, 14, 6, 36, 16, 7, 19];
const PART_2_INDEXES = [16, 1, 32, 12, 19, 27, 8, 5];
const SCRAMBLE_VALUES = [89, 39, 179, 150, 218, 82, 58, 252, 177, 52, 186, 123, 120, 64, 242, 133, 143, 161, 121, 179];

export const zzcSign = (payload: string): string => {
	const hash = createHash('sha1').update(payload, 'utf8').digest('hex').toUpperCase();
	const part1 = PART_1_INDEXES.map(index => hash[index]).join('');
	const part2 = PART_2_INDEXES.map(index => hash[index]).join('');
	const part3 = Buffer.from(
		SCRAMBLE_VALUES.map((value, index) => value ^ Number.parseInt(hash.slice(index * 2, index * 2 + 2), 16)),
	);
	const base64 = part3.toString('base64').replace(/[\\/+=]/g, '');
	return `zzc${part1}${base64}${part2}`.toLowerCase();
};

const getEffectiveCookie = (cookie?: string): string | undefined =>
	cookie === undefined ? getUserInfo().cookie : cookie;

const resolveUin = (cookie?: string): string => {
	const effectiveCookie = getEffectiveCookie(cookie);
	return extractUinFromCookie(effectiveCookie) || (cookie === undefined ? getUserUin('') : '');
};

const buildComm = (cookie?: string): Record<string, unknown> => {
	const effectiveCookie = getEffectiveCookie(cookie);
	const uin = resolveUin(cookie);
	const authst = extractCookieValue(effectiveCookie, 'qqmusic_key');
	const pSkey = extractCookieValue(effectiveCookie, 'p_skey');

	return {
		uin,
		loginUin: uin,
		format: 'json',
		ct: 24,
		cv: 4747474,
		platform: 'yqq.json',
		...(authst ? { authst } : {}),
		...(pSkey ? { g_tk: getGtk(pSkey) } : {}),
	};
};

interface UserMusicuOptions {
	module: string;
	method: string;
	param: Record<string, unknown>;
	cookie?: string;
	signed?: boolean;
}

export const callUserMusicu = ({
	module,
	method,
	param,
	cookie,
	signed = false,
}: UserMusicuOptions): Promise<ApiResponse> => {
	const payload = {
		comm: buildComm(cookie),
		req_1: { module, method, param },
	};
	const serializedPayload = JSON.stringify(payload);

	return handleApi(
		request({
			url: `https://u.y.qq.com/cgi-bin/${signed ? 'musics' : 'musicu'}.fcg`,
			method: 'POST' as Method,
			isUUrl: 'u',
			cookie,
			options: {
				headers: { 'Content-Type': 'application/json', Referer: 'https://y.qq.com/' },
				data: serializedPayload,
				...(signed
					? {
							params: {
								_: Date.now(),
								sign: zzcSign(serializedPayload),
							},
						}
					: {}),
			},
		}),
	);
};
