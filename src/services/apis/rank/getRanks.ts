import u_common from '../u_common';
import {
	findSongListLocation,
	normalizeSongItem,
	type NormalizedSong,
	type RankResponseShape,
} from '../../../util/song-normalize';

interface GetRanksParams {
	topId?: number;
	num?: number;
	offset?: number;
	resolveMid?: boolean;
}

const getWeekNumber = (d: Date): string => {
	const utcDay = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
	const dayNum = utcDay.getUTCDay() || 7;
	utcDay.setUTCDate(utcDay.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(utcDay.getUTCFullYear(), 0, 1));
	const week = Math.ceil(((utcDay.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	return `${utcDay.getUTCFullYear()}_${week}`;
};

interface SongDetailResponse {
	songinfo?: {
		data?: {
			track_info?: { mid?: string; id?: number };
			trackInfo?: { mid?: string; id?: number };
		};
	};
}

const MID_RESOLVE_CONCURRENCY = 5;

const fetchSongMidBySongId = async (songId: number): Promise<string | undefined> => {
	const response = await u_common({
		method: 'get',
		params: {
			format: 'json',
			data: JSON.stringify({
				comm: { ct: 24, cv: 0 },
				songinfo: {
					method: 'get_song_detail_yqq',
					param: { song_type: 0, song_mid: '', song_id: songId },
					module: 'music.pf_song_detail_svr',
				},
			}),
		},
	});

	const data = response.data as SongDetailResponse;
	return data?.songinfo?.data?.track_info?.mid ?? data?.songinfo?.data?.trackInfo?.mid;
};

const resolveSongMids = async (songs: NormalizedSong[]): Promise<Map<number, string>> => {
	const songIds = [
		...new Set(
			songs.flatMap(song => {
				if (song.song_mid || song.mid || song.songId === undefined) return [];
				const songId = Number(song.songId);
				return Number.isFinite(songId) ? [songId] : [];
			}),
		),
	];
	const midBySongId = new Map<number, string>();
	let nextIndex = 0;

	const worker = async (): Promise<void> => {
		while (nextIndex < songIds.length) {
			const songId = songIds[nextIndex];
			nextIndex += 1;
			const mid = await fetchSongMidBySongId(songId);
			if (mid) midBySongId.set(songId, mid);
		}
	};

	const workerCount = Math.min(MID_RESOLVE_CONCURRENCY, songIds.length);
	await Promise.all(Array.from({ length: workerCount }, worker));
	return midBySongId;
};

/**
 * 获取排行榜详情
 * @param options - topId 榜单 ID、num 数量、offset 偏移、resolveMid 是否补齐缺失的 song_mid、period 期数
 */
export default async ({
	topId = 4,
	num = 20,
	offset = 0,
	resolveMid = false,
}: GetRanksParams = {}): Promise<RankResponseShape> => {
	const period = getWeekNumber(new Date());
	const data = {
		comm: {
			ct: 24,
			cv: 4747474,
			format: 'json',
			inCharset: 'utf-8',
			needNewCode: 1,
			uin: 0,
		},
		req_1: {
			module: 'musicToplist.ToplistInfoServer',
			method: 'GetDetail',
			param: {
				topId,
				offset,
				num,
				period,
			},
		},
	};

	const params = {
		format: 'json',
		data: JSON.stringify(data),
	};

	const response = await u_common({ method: 'get', params });
	const responseData = response.data as RankResponseShape;

	const location = findSongListLocation(responseData);
	if (location) {
		const songList = location.container[location.key] as NormalizedSong[];
		const normalizedList = songList.map(normalizeSongItem);

		if (resolveMid) {
			const midBySongId = await resolveSongMids(normalizedList);
			normalizedList.forEach(song => {
				if (song.song_mid || song.mid || song.songId === undefined) return;
				const fetchedMid = midBySongId.get(Number(song.songId));
				if (!fetchedMid) return;
				song.song_mid = fetchedMid;
				song.mid = fetchedMid;
			});
		}

		location.container[location.key] = normalizedList;
	}

	return responseData;
};
