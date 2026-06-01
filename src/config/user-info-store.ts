import userInfoImport from './user-info';
import type { UserInfo } from '../types';

const createEmptyUserInfo = (): UserInfo => ({
	loginUin: '',
	uin: '',
	cookie: '',
	cookieList: [],
	cookieObject: {},
	refreshData: () => ({}),
});

export const setUserInfo = (userInfo: UserInfo): UserInfo => {
	global.userInfo = userInfo || createEmptyUserInfo();
	return global.userInfo;
};

export const initializeUserInfo = (userInfo: UserInfo = userInfoImport as UserInfo): UserInfo => setUserInfo(userInfo);

export const getUserInfo = (): UserInfo => {
	if (!global.userInfo) {
		return initializeUserInfo();
	}

	return global.userInfo;
};

export const getUserCookie = (): string => getUserInfo().cookie || '';

export const getUserUin = (fallback = '0'): string => {
	const userInfo = getUserInfo();
	return String(userInfo.uin || userInfo.loginUin || fallback);
};
