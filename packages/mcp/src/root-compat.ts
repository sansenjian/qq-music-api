import {
	getConfigDir as rootGetConfigDir,
	resolveConfigPath as rootResolveConfigPath,
} from '../../../src/config/config-path';
import { getUserInfo as rootGetUserInfo } from '../../../src/config/user-info-store';
import { apiMetadata as rootApiMetadata } from '../../../src/routes/api-metadata';
import {
	downloadQQMusic as rootDownloadQQMusic,
	getAlbumInfo as rootGetAlbumInfo,
	getAlbumSongs as rootGetAlbumSongs,
	getComments as rootGetComments,
	getDailyRecommend as rootGetDailyRecommend,
	getDigitalAlbumLists as rootGetDigitalAlbumLists,
	getHotComments as rootGetHotComments,
	getHotKey as rootGetHotKey,
	getLyric as rootGetLyric,
	getMusicPlay as rootGetMusicPlay,
	getMvByTag as rootGetMvByTag,
	getMvCategory as rootGetMvCategory,
	getNewSongs as rootGetNewSongs,
	getPersonalRecommend as rootGetPersonalRecommend,
	getPlaylistTags as rootGetPlaylistTags,
	getPlaylistsByTag as rootGetPlaylistsByTag,
	getPrivateFM as rootGetPrivateFM,
	getRadioLists as rootGetRadioLists,
	getRecommendBanner as rootGetRecommendBanner,
	getRelatedMv as rootGetRelatedMv,
	getRelatedPlaylists as rootGetRelatedPlaylists,
	getSearchByKey as rootGetSearchByKey,
	getSimilarSinger as rootGetSimilarSinger,
	getSingerCategory as rootGetSingerCategory,
	getSingerDesc as rootGetSingerDesc,
	getSingerMv as rootGetSingerMv,
	getSingerStarNum as rootGetSingerStarNum,
	getSmartbox as rootGetSmartbox,
	getTopLists as rootGetTopLists,
	getSimilarSongs as rootGetSimilarSongs,
	getSingerListByArea as rootGetSingerListByArea,
	getUserCollectedAlbums as rootGetUserCollectedAlbums,
	getUserCollectedSongLists as rootGetUserCollectedSongLists,
	getUserAvatar as rootGetUserAvatar,
	getUserDetail as rootGetUserDetail,
	getUserFans as rootGetUserFans,
	getUserFollowSingers as rootGetUserFollowSingers,
	getUserFollowUsers as rootGetUserFollowUsers,
	getUserLikedSongs as rootGetUserLikedSongs,
	getUserPlaylists as rootGetUserPlaylists,
	songListDetail as rootSongListDetail,
	songListCategories as rootSongListCategories,
	songLists as rootSongLists,
} from '../../../src/services';
import { getCookieKeys as rootGetCookieKeys } from '../../../src/util/cookieResolver';

export interface ServiceCallOptions {
	method?: string;
	params?: Record<string, unknown>;
	option?: Record<string, unknown>;
	isFormat?: boolean | string;
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
	aliases?: string[];
	description?: string;
	queryParams?: Array<{
		name: string;
		required?: boolean;
		description?: string;
		defaultValue?: string | number | boolean;
		example?: string | number | boolean;
		enumValues?: Array<string | number | boolean>;
	}>;
	pathParams?: Array<{
		name: string;
		required?: boolean;
		description?: string;
		defaultValue?: string | number | boolean;
		example?: string | number | boolean;
		enumValues?: Array<string | number | boolean>;
	}>;
	bodyExample?: unknown;
	examples?: Array<{
		label: string;
		params?: Record<string, unknown>;
		body?: unknown;
	}>;
	authRequired?: boolean;
	cookieRequired?: boolean;
}

export type UserReadonlyServiceCall = (params: {
	uin: string;
	page?: number;
	limit?: number;
	cookie?: string;
}) => Promise<ServiceResponse>;

export type UserOffsetServiceCall = (params: {
	uin: string;
	offset?: number;
	limit?: number;
	cookie?: string;
}) => Promise<ServiceResponse>;

export type UserAvatarServiceCall = (params: { uin?: string; k?: string; size?: number }) => Promise<{
	avatarUrl: string;
	message: string;
}>;

export type DailyRecommendServiceCall = (cookie?: string) => Promise<ServiceResponse>;

export type NewSongsServiceCall = (areaId?: number, limit?: number) => Promise<ServiceResponse>;

export type PersonalRecommendServiceCall = (type?: number, cookie?: string) => Promise<ServiceResponse>;

export type SimilarSongsServiceCall = (songmid: string, cookie?: string) => Promise<ServiceResponse>;

export type PlaylistTagsServiceCall = () => Promise<ServiceResponse>;

export type PlaylistsByTagServiceCall = (tagId?: number, page?: number, num?: number) => Promise<ServiceResponse>;

export type HotCommentsServiceCall = (
	id: string,
	type?: number,
	page?: number,
	pagesize?: number,
) => Promise<ServiceResponse>;

export type SingerListByAreaServiceCall = (
	area?: number,
	sex?: number,
	genre?: number,
	page?: number,
	pagesize?: number,
) => Promise<ServiceResponse>;

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

export const downloadQQMusic: ServiceCall = options => rootDownloadQQMusic(options);

export const getAlbumInfo: ServiceCall = options => rootGetAlbumInfo(options);

export const getAlbumSongs: ServiceCall = options => rootGetAlbumSongs(options);

export const getComments: ServiceCall = options => rootGetComments(options);

export const getDailyRecommend: DailyRecommendServiceCall = cookie => rootGetDailyRecommend(cookie);

export const getDigitalAlbumLists: ServiceCall = options => rootGetDigitalAlbumLists(options);

export const getHotComments: HotCommentsServiceCall = (id, type, page, pagesize) =>
	rootGetHotComments(id, type, page, pagesize);

export const getHotKey: ServiceCall = options => rootGetHotKey(options);

export const getLyric: ServiceCall = options => rootGetLyric(options);

export const getMusicPlay: ServiceCall = options => rootGetMusicPlay(options);

export const getMvByTag: ServiceCall = options => rootGetMvByTag(options);

export const getMvCategory: ServiceCall = options => rootGetMvCategory(options);

export const getNewSongs: NewSongsServiceCall = (areaId, limit) => rootGetNewSongs(areaId, limit);

export const getPersonalRecommend: PersonalRecommendServiceCall = (type, cookie) =>
	rootGetPersonalRecommend(type, cookie);

export const getPlaylistTags: PlaylistTagsServiceCall = () => rootGetPlaylistTags();

export const getPlaylistsByTag: PlaylistsByTagServiceCall = (tagId, page, num) =>
	rootGetPlaylistsByTag(tagId, page, num);

export const getPrivateFM: DailyRecommendServiceCall = cookie => rootGetPrivateFM(cookie);

export const getRadioLists: ServiceCall = options => rootGetRadioLists(options);

export const getRecommendBanner: ServiceCall = options => rootGetRecommendBanner(options);

export const getRelatedMv: ServiceCall = options => rootGetRelatedMv(options);

export const getRelatedPlaylists: ServiceCall = options => rootGetRelatedPlaylists(options);

export const getSearchByKey: ServiceCall = options => rootGetSearchByKey(options);

export const getSimilarSinger: ServiceCall = options => rootGetSimilarSinger(options);

export const getSingerCategory: ServiceCall = options => rootGetSingerCategory(options);

export const getSingerDesc: ServiceCall = options => rootGetSingerDesc(options);

export const getSingerMv: ServiceCall = options => rootGetSingerMv(options);

export const getSingerStarNum: ServiceCall = options => rootGetSingerStarNum(options);

export const getSmartbox: ServiceCall = options => rootGetSmartbox(options);

export const getSongListCategories: ServiceCall = options => rootSongListCategories(options);

export const getTopLists: ServiceCall = options => rootGetTopLists(options);

export const getSimilarSongs: SimilarSongsServiceCall = (songmid, cookie) => rootGetSimilarSongs(songmid, cookie);

export const getSingerListByArea: SingerListByAreaServiceCall = (area, sex, genre, page, pagesize) =>
	rootGetSingerListByArea(area, sex, genre, page, pagesize);

export const getUserAvatar: UserAvatarServiceCall = params => rootGetUserAvatar(params);

export const getUserCollectedAlbums: UserReadonlyServiceCall = params => rootGetUserCollectedAlbums(params);

export const getUserCollectedSongLists: UserReadonlyServiceCall = params => rootGetUserCollectedSongLists(params);

export const getUserDetail: UserReadonlyServiceCall = params => rootGetUserDetail(params);

export const getUserFans: UserReadonlyServiceCall = params => rootGetUserFans(params);

export const getUserFollowSingers: UserReadonlyServiceCall = params => rootGetUserFollowSingers(params);

export const getUserFollowUsers: UserReadonlyServiceCall = params => rootGetUserFollowUsers(params);

export const getUserLikedSongs: UserOffsetServiceCall = params => rootGetUserLikedSongs(params);

export const getUserPlaylists: UserOffsetServiceCall = params => rootGetUserPlaylists(params);

export const songListDetail: ServiceCall = options => rootSongListDetail(options);

export const songLists: ServiceCall = options => rootSongLists(options);

export const getCookieKeys = (cookie: string | undefined): string[] => rootGetCookieKeys(cookie);
