import {
	checkQQLoginQr,
	getLyric,
	getMusicPlay,
	getQQLoginQr,
	getSearchByKey,
} from './services';
import type { ApiOptions, ApiResponse } from './types/api';

type RequestOption = ApiOptions['option'];

export interface SearchOptions {
	key: string;
	limit?: number;
	page?: number;
	catZhida?: number;
	remoteplace?: string;
	option?: RequestOption;
}

export interface GetMusicPlayOptions {
	songmid: string | string[];
	quality?: string | number;
	resType?: string;
	mediaId?: string;
	cookie?: string;
	option?: RequestOption;
}

export interface GetLyricOptions {
	songmid?: string;
	songid?: string;
	isFormat?: boolean | string;
	cookie?: string;
	option?: RequestOption;
}

export interface CheckQQLoginQrOptions {
	ptqrtoken: string | number;
	qrsig: string;
}

const withCookie = (option: RequestOption = {}, cookie?: string): RequestOption => {
	if (!cookie) {
		return option;
	}

	const headers = {
		...(option as Record<string, any>).headers,
		Cookie: cookie,
	};

	return {
		...(option as Record<string, any>),
		headers,
	};
};

export const search = async ({
	key,
	limit = 10,
	page = 1,
	catZhida = 1,
	remoteplace = 'song',
	option = {},
}: SearchOptions): Promise<ApiResponse> => getSearchByKey({
	method: 'get',
	params: {
		w: key,
		n: limit,
		p: page,
		catZhida,
		remoteplace: `txt.yqq.${remoteplace}`,
	},
	option,
});

export const getPlayUrl = async ({
	songmid,
	quality,
	resType = 'play',
	mediaId,
	cookie,
	option = {},
}: GetMusicPlayOptions): Promise<ApiResponse> => getMusicPlay({
	method: 'get',
	params: {
		songmid,
		quality,
		resType,
		mediaId,
	},
	option: withCookie(option, cookie),
});

export const lyric = async ({
	songmid,
	songid,
	isFormat = false,
	cookie,
	option = {},
}: GetLyricOptions): Promise<ApiResponse> => getLyric({
	method: 'get',
	params: {
		songmid,
		songid,
	},
	isFormat,
	option: withCookie(option, cookie),
});

export const getLoginQr = async (): Promise<ApiResponse> => getQQLoginQr({});

export const checkLoginQr = async ({
	ptqrtoken,
	qrsig,
}: CheckQQLoginQrOptions): Promise<ApiResponse> => checkQQLoginQr({
	method: 'post',
	params: {
		ptqrtoken,
		qrsig,
	},
});

export {
	checkLoginQr as checkQQLoginQr,
	getLoginQr as getQQLoginQr,
	getPlayUrl as getMusicPlay,
	lyric as getLyric,
};
