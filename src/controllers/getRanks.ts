import { KoaContext } from '../routes/types';
import { UCommon } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';
import {
  findSongListLocation,
  normalizeSongItem,
  type NormalizedSong,
  type RankResponseShape,
} from '../util/song-normalize';

interface SongDetailResponse {
  songinfo?: {
    data?: {
      track_info?: {
        mid?: string;
        id?: number;
      };
      trackInfo?: {
        mid?: string;
        id?: number;
      };
    };
  };
}

const MID_RESOLVE_CONCURRENCY = 5;

/**
 * Fetch song mid by song id using the song detail API.
 * Logs errors so upstream / network issues remain visible while returning
 * undefined when no mid is available for a given song.
 */
const fetchSongMidBySongId = async (songId: number): Promise<string | undefined> => {
  try {
    const response = await UCommon({
      method: 'get',
      params: {
        format: 'json',
        data: JSON.stringify({
          comm: {
            ct: 24,
            cv: 0,
          },
          songinfo: {
            method: 'get_song_detail_yqq',
            param: {
              song_type: 0,
              song_mid: '',
              song_id: songId,
            },
            module: 'music.pf_song_detail_svr',
          },
        }),
      },
      option: {},
    });

    const data = response.data as SongDetailResponse;
    return (
      data?.songinfo?.data?.track_info?.mid ??
      data?.songinfo?.data?.trackInfo?.mid
    );
  } catch (error) {
    console.error('[getRanks] Failed to resolve song mid by song id:', error);
    return undefined;
  }
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

const getRanksController = withErrorHandler(async (ctx: KoaContext) => {
  const getWeekNumber = (d: Date): number => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const topId = +ctx.query.topId || 4;
  const num = +ctx.query.limit || 20;
  const offset = +ctx.query.page || 0;
  const resolveMidRaw = Array.isArray(ctx.query.resolveMid)
    ? ctx.query.resolveMid[0]
    : ctx.query.resolveMid;
  const resolveMid = resolveMidRaw === 'true';

  const date = new Date();
  const week = getWeekNumber(date);
  const isoWeekYearVal = date.getFullYear();
  const period = `${isoWeekYearVal}_${week}`;

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

  const props = {
    method: 'get',
    params,
    option: {},
  };

  const response = await UCommon(props);
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

  setApiResponse(ctx, customResponse({ response: responseData }, 200));
});

export default getRanksController;
