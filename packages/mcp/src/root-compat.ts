import { getConfigDir as rootGetConfigDir, resolveConfigPath as rootResolveConfigPath } from '../../../src/config/config-path';
import { getUserInfo as rootGetUserInfo } from '../../../src/config/user-info-store';
import { apiMetadata as rootApiMetadata } from '../../../src/routes/api-metadata';
import {
	getAlbumInfo as rootGetAlbumInfo,
	getHotKey as rootGetHotKey,
	getSearchByKey as rootGetSearchByKey,
	getTopLists as rootGetTopLists,
	songListDetail as rootSongListDetail,
} from '../../../src/services';
import { getCookieKeys as rootGetCookieKeys } from '../../../src/util/cookieResolver';

export interface ServiceCallOptions {
	method?: string;
	params?: Record<string, unknown>;
	option?: Record<string, unknown>;
}

export interface ServiceResponseBody {
	response?: unknown;
	error?: unknown;
	data?: unknown;
	[key: string]: unknown;
}

export interface ServiceResponse {
	status: number;
	body: ServiceResponseBody;
}

export type ServiceCall = (options: ServiceCallOptions) => Promise<ServiceResponse>;

export interface UserInfoSnapshot {
	loginUin: string;
	uin: string;
	cookie: string;
}

export interface ApiCatalogEntry {
	name: string;
	category: string;
	method: string;
	path: string;
	cookieRequired?: boolean;
}

export const getConfigDir = (): string => rootGetConfigDir();

export const resolveConfigPath = (fileName: string): string => rootResolveConfigPath(fileName);

export const getUserInfo = (): UserInfoSnapshot => {
	const userInfo = rootGetUserInfo();
	return {
		loginUin: userInfo.loginUin || '',
		uin: userInfo.uin || '',
		cookie: userInfo.cookie || '',
	};
};

export const apiMetadata: ApiCatalogEntry[] = rootApiMetadata as ApiCatalogEntry[];

export const getAlbumInfo: ServiceCall = options => rootGetAlbumInfo(options);

export const getHotKey: ServiceCall = options => rootGetHotKey(options);

export const getSearchByKey: ServiceCall = options => rootGetSearchByKey(options);

export const getTopLists: ServiceCall = options => rootGetTopLists(options);

export const songListDetail: ServiceCall = options => rootSongListDetail(options);

export const getCookieKeys = (cookie: string | undefined): string[] => rootGetCookieKeys(cookie);
