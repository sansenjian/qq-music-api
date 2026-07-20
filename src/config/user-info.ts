import fs from 'node:fs';
import path from 'node:path';
import { getConfigDir, resolveConfigPath } from './config-path';

interface UserInfo {
	loginUin: string;
	uin?: string;
	euin?: string;
	cookie: string;
	cookieList: string[];
	cookieObject: Record<string, string>;
	refreshData: (cookie: string) => any;
	[key: string]: any;
}

let userInfo: UserInfo = { loginUin: '', cookie: '', cookieList: [], cookieObject: {}, refreshData: () => ({}) };
let cookieList: string[] = [];
let cookieObject: Record<string, string> = {};

const infoPath = resolveConfigPath('user-info.json');

const ensureConfigDir = () => {
	fs.mkdirSync(path.dirname(infoPath), { recursive: true });
};

const parseCookieObject = (cookie: string): Record<string, string> => {
	const parsed: Record<string, string> = {};

	cookie
		.split(';')
		.map(item => item.trim())
		.filter(Boolean)
		.forEach(item => {
			const separatorIndex = item.indexOf('=');
			if (separatorIndex <= 0) return;

			const key = item.slice(0, separatorIndex).trim();
			const value = item.slice(separatorIndex + 1).trim();
			if (key) parsed[key] = value;
		});

	return parsed;
};

const normalizeUserInfo = (value: unknown): UserInfo => {
	const parsed = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
	return {
		loginUin: typeof parsed.loginUin === 'string' ? parsed.loginUin : '',
		cookie: typeof parsed.cookie === 'string' ? parsed.cookie : '',
		...(typeof parsed.euin === 'string' && parsed.euin.trim() ? { euin: parsed.euin.trim() } : {}),
		cookieList: [],
		cookieObject: {},
		refreshData: () => ({}),
	};
};

const initData = () => {
	try {
		userInfo = normalizeUserInfo(JSON.parse(fs.readFileSync(infoPath, 'utf-8')));
	} catch {
		userInfo = { loginUin: '', cookie: '', cookieList: [], cookieObject: {}, refreshData: () => ({}) };
	}
	cookieList = (userInfo.cookie || '').split(';').map(item => item.trim()).filter(Boolean);
	cookieObject = parseCookieObject(userInfo.cookie || '');
};

const refreshData = (cookie: string) => {
	const uinMatch = cookie.match(/(?:^|;\s*)uin=([^;]+)/);
	const uin = uinMatch ? uinMatch[1] : '';
	ensureConfigDir();
	fs.writeFileSync(infoPath, JSON.stringify({ loginUin: uin, cookie }), 'utf-8');
	initData();
	return {
		...userInfo,
		uin: userInfo.loginUin || cookieObject.uin,
		cookieList,
		cookieObject,
	};
};

initData();

const exportObj: UserInfo = {
	loginUin: userInfo?.loginUin || '',
	uin: userInfo?.loginUin || cookieObject?.uin || '',
	cookie: userInfo?.cookie || '',
	cookieList: cookieList || [],
	cookieObject: cookieObject || {},
	refreshData,
};

export { getConfigDir };
export { normalizeUserInfo, parseCookieObject };
export default exportObj as UserInfo;
