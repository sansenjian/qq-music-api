import type { UserInfo } from '../../../src/types';
import {
	getUserCookie,
	getUserInfo,
	getUserUin,
	initializeUserInfo,
	setUserInfo,
} from '../../../src/config/user-info-store';

const createUserInfo = (overrides: Partial<UserInfo> = {}): UserInfo => ({
	loginUin: '123456',
	uin: 'o123456',
	cookie: 'uin=o123456; qqmusic_key=mock-key',
	cookieList: ['uin=o123456', 'qqmusic_key=mock-key'],
	cookieObject: {
		uin: 'o123456',
		qqmusic_key: 'mock-key',
	},
	refreshData: () => ({}),
	...overrides,
});

describe('config/user-info-store', () => {
	let originalUserInfo: UserInfo;

	beforeEach(() => {
		originalUserInfo = global.userInfo;
	});

	afterEach(() => {
		global.userInfo = originalUserInfo;
	});

	test('should set and return the active user info', () => {
		const userInfo = createUserInfo();

		expect(setUserInfo(userInfo)).toBe(userInfo);
		expect(getUserInfo()).toBe(userInfo);
	});

	test('should initialize global user info when missing', () => {
		const userInfo = createUserInfo({ loginUin: '999', uin: 'o999' });
		delete (global as Partial<typeof globalThis>).userInfo;

		expect(initializeUserInfo(userInfo)).toBe(userInfo);
		expect(getUserInfo()).toBe(userInfo);
	});

	test('should expose common cookie and uin accessors', () => {
		setUserInfo(createUserInfo());

		expect(getUserCookie()).toBe('uin=o123456; qqmusic_key=mock-key');
		expect(getUserUin()).toBe('o123456');
	});

	test('should fall back from uin to loginUin', () => {
		setUserInfo(createUserInfo({ uin: '' }));

		expect(getUserUin()).toBe('123456');
	});

	test('should use caller fallback when both uin and loginUin are empty', () => {
		setUserInfo(createUserInfo({ uin: '', loginUin: '' }));

		expect(getUserUin('fallback-uin')).toBe('fallback-uin');
	});
});
