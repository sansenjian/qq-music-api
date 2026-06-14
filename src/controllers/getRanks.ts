import { KoaContext } from '../routes/types';
import { UCommon } from '../services';
import { setApiResponse, withErrorHandler } from './util';
import { customResponse } from '../util/apiResponse';

interface SongItem {
  songId?: number;
  song_id?: number;
  id?: number;
  mid?: string;
  song_mid?: string;
  songName?: string;
  singerName?: string;
  [key: string]: unknown;
}

interface RankResponse {
  req_1?: {
    data?: {
      data?: {
        songInfoList?: SongItem[];
        song_info_list?: SongItem[];
        songList?: SongItem[];
        song_list?: SongItem[];
      };
      songInfoList?: SongItem[];
      song_info_list?: SongItem[];
      songList?: SongItem[];
      song_list?: SongItem[];
    };
  };
  [key: string]: unknown;
}

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

/**
 * Fetch song mid by song id using the song detail API
 */
const fetchSongMidBySongId = async (songId: number): Promise<string | undefined> => {
  try {
    const response = await UCommon({
      method: 'get',
      params: {
        format: 'json',
        data: {
          comm: {
            ct: 24,
            cv: 0
          },
          songinfo: {
            method: 'get_song_detail_yqq',
            param: {
              song_type: 0,
              song_mid: '',
              song_id: songId
            },
            module: 'music.pf_song_detail_svr'
          }
        }
      },
      option: {}
    });

    const data = response.data as SongDetailResponse;
    return data?.songinfo?.data?.track_info?.mid || data?.songinfo?.data?.trackInfo?.mid;
  } catch {
    return undefined;
  }
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
      uin: 0
    },
    req_1: {
      module: 'musicToplist.ToplistInfoServer',
      method: 'GetDetail',
      param: {
        topId,
        offset,
        num,
        period
      }
    }
  };

  const params = {
    format: 'json',
    data: JSON.stringify(data)
  };

  const props = {
    method: 'get',
    params,
    option: {}
  };

  const response = await UCommon(props);
  const responseData = response.data as RankResponse;

  /**
   * Normalize song list to ensure song_mid field exists
   * If song_mid is missing, fetch it from song detail API using song_id
   */
  const normalizeSongList = async (songList: SongItem[] | undefined): Promise<SongItem[]> => {
    if (!songList || !Array.isArray(songList)) return [];

    return Promise.all(songList.map(async song => {
      const normalizedSong = { ...song };

      // Ensure song_id exists (may be named 'songId' or 'id' in API response)
      const songId = normalizedSong.song_id || normalizedSong.songId || normalizedSong.id;
      if (songId !== undefined) {
        normalizedSong.song_id = songId;
        normalizedSong.songId = songId;
      }

      // Check if song_mid already exists (may be named 'mid' in API response)
      const existingMid = normalizedSong.song_mid || normalizedSong.mid;

      if (existingMid) {
        // Already has song_mid, just ensure both fields are set
        normalizedSong.song_mid = existingMid;
        normalizedSong.mid = existingMid;
      } else if (songId) {
        // No song_mid, fetch it from song detail API
        const fetchedMid = await fetchSongMidBySongId(Number(songId));
        if (fetchedMid) {
          normalizedSong.song_mid = fetchedMid;
          normalizedSong.mid = fetchedMid;
        }
      }

      return normalizedSong;
    }));
  };

  // Find and normalize the song list in the response
  const songData = responseData?.req_1?.data;
  if (songData) {
    const songListPath = songData.data?.songInfoList ||
      songData.data?.song_info_list ||
      songData.data?.songList ||
      songData.data?.song_list ||
      songData.songInfoList ||
      songData.song_info_list ||
      songData.songList ||
      songData.song_list;

    if (songListPath && Array.isArray(songListPath)) {
      const normalizedList = await normalizeSongList(songListPath);

      // Update the response with normalized song list
      if (songData.data?.songInfoList) {
        songData.data.songInfoList = normalizedList;
      } else if (songData.data?.song_info_list) {
        songData.data.song_info_list = normalizedList;
      } else if (songData.data?.songList) {
        songData.data.songList = normalizedList;
      } else if (songData.data?.song_list) {
        songData.data.song_list = normalizedList;
      } else if (songData.songInfoList) {
        songData.songInfoList = normalizedList;
      } else if (songData.song_info_list) {
        songData.song_info_list = normalizedList;
      } else if (songData.songList) {
        songData.songList = normalizedList;
      } else if (songData.song_list) {
        songData.song_list = normalizedList;
      }
    }
  }

  setApiResponse(ctx, customResponse({ response: responseData }, 200));
});

export default getRanksController;
