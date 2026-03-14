import { lyricParse } from '../../../util/lyricParse';
import y_common from '../y_common';
import type { ApiOptions } from '../../../types/api';
import { extractUinFromCookie } from '../../../util/cookieResolver';
import UCommon from '../UCommon/UCommon';

type LyricPayload = Record<string, any>;
const MUSICU_TIMEOUT_MS = 10000;

const getCookieFromOptions = (option: ApiOptions['option']): string | undefined => {
  if (!option || typeof option !== 'object') {
    return undefined;
  }

  const headers = (option as Record<string, unknown>).headers;
  if (!headers || typeof headers !== 'object') {
    return undefined;
  }

  const cookie = (headers as Record<string, unknown>).Cookie || (headers as Record<string, unknown>).cookie;
  return typeof cookie === 'string' ? cookie : undefined;
};

const resolveUin = (cookie?: string): string => {
  return extractUinFromCookie(cookie) || String((global as any).userInfo?.loginUin || '0');
};

const decodeLyricField = (value: unknown): string => {
  if (typeof value !== 'string' || !value) {
    return '';
  }

  try {
    const decoded = Buffer.from(value, 'base64').toString();
    return decoded || value;
  } catch {
    return value;
  }
};

const normalizeLyricResponse = (resData: LyricPayload, isFormat: boolean): LyricPayload => {
  const lyricString = decodeLyricField(resData?.lyric);
  const lyric = isFormat && lyricString ? lyricParse(lyricString) : lyricString;

  return {
    ...resData,
    lyric
  };
};

const hasNegativeBizCode = (data: LyricPayload): boolean => {
  const codes = [data?.retcode, data?.code, data?.subcode]
    .map(item => Number(item))
    .filter(item => !Number.isNaN(item));

  return codes.some(item => item < 0);
};

const normalizeSongId = (value: unknown): string | undefined => {
  const id = Number(value);
  if (Number.isFinite(id) && id > 0) {
    return String(id);
  }
  return undefined;
};

const mergePrimaryAndFallbackPayload = (
  primaryPayload: LyricPayload,
  fallbackPayload: LyricPayload
): LyricPayload => {
  const merged = {
    ...primaryPayload,
    ...fallbackPayload
  };

  // When fallback succeeds but does not include status fields, force success codes
  // to avoid preserving negative primary codes in response.
  if (!Object.prototype.hasOwnProperty.call(fallbackPayload, 'retcode')) {
    merged.retcode = 0;
  }
  if (!Object.prototype.hasOwnProperty.call(fallbackPayload, 'code')) {
    merged.code = 0;
  }
  if (!Object.prototype.hasOwnProperty.call(fallbackPayload, 'subcode')) {
    merged.subcode = 0;
  }

  return merged;
};

const resolveSongIdBySongmid = async ({
  songmid,
  loginUin
}: {
  songmid: string;
  loginUin: string;
}): Promise<string | undefined> => {
  const response = await UCommon({
    method: 'get',
    params: {
      format: 'json',
      data: {
        comm: {
          uin: loginUin,
          ct: 24,
          cv: 0
        },
        songinfo: {
          method: 'get_song_detail_yqq',
          param: {
            song_type: 0,
            song_mid: songmid,
            song_id: 0
          },
          module: 'music.pf_song_detail_svr'
        }
      }
    },
    option: {}
  });

  const data = (response?.data || {}) as LyricPayload;
  return normalizeSongId(
    data?.songinfo?.data?.track_info?.id ||
    data?.songinfo?.data?.trackInfo?.id ||
    data?.track_info?.id
  );
};

const fetchLyricByMusicu = async ({
  songmid,
  songid,
  loginUin,
  cookie
}: {
  songmid?: string;
  songid?: string;
  loginUin: string;
  cookie?: string;
}): Promise<LyricPayload> => {
  const reqPayload = {
    req_0: {
      module: 'music.musichallSong.PlayLyricInfo',
      method: 'GetPlayLyricInfo',
      param: {
        songMID: songmid || '',
        songID: Number(songid || 0),
        trans_t: 0,
        roma_t: 0,
        qrc_t: 0,
        crypt: 1,
        lrc_t: 0,
        interval: 0
      }
    },
    loginUin,
    comm: {
      uin: loginUin,
      format: 'json',
      ct: 24,
      cv: 0
    }
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MUSICU_TIMEOUT_MS);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Referer: 'https://y.qq.com/portal/player.html',
    Origin: 'https://y.qq.com'
  };

  if (cookie) {
    headers.Cookie = cookie;
  }

  const response = await (async () => {
    try {
      return await fetch('https://u.y.qq.com/cgi-bin/musicu.fcg', {
        method: 'POST',
        headers,
        body: JSON.stringify(reqPayload),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timer);
    }
  })();
  const raw = await response.text();
  const upstream = JSON.parse(raw || '{}') as LyricPayload;

  return (upstream?.req_0?.data || upstream?.PlayLyricInfo?.data || {}) as LyricPayload;
};

export default async ({ method = 'get', params = {}, option = {}, isFormat = false }: ApiOptions) => {
  const cookie = getCookieFromOptions(option);
  const loginUin = resolveUin(cookie);
  const songmid = typeof (params as Record<string, unknown>).songmid === 'string'
    ? (params as Record<string, string>).songmid
    : undefined;
  const songid = typeof (params as Record<string, unknown>).songid === 'string'
    ? (params as Record<string, string>).songid
    : undefined;

  const data = Object.assign(params, {
    format: 'json',
    outCharset: 'utf-8',
    pcachetime: Date.now(),
    loginUin
  });

  const options = Object.assign(option, {
    headers: Object.assign({}, (option as Record<string, unknown>)?.headers || {}, {
      referer: 'https://y.qq.com/portal/player.html',
      host: 'c.y.qq.com'
    }),
    params: data
  });

  try {
    const primaryResponse = await y_common({
      url: '/lyric/fcgi-bin/fcg_query_lyric_new.fcg',
      method: method as import('axios').Method,
      options
    });

    let payload = (primaryResponse?.data || {}) as LyricPayload;

    if (hasNegativeBizCode(payload)) {
      try {
        let fallbackPayload = await fetchLyricByMusicu({
          songmid,
          songid,
          loginUin,
          cookie
        });

        if (hasNegativeBizCode(fallbackPayload) && !normalizeSongId(songid) && songmid) {
          const resolvedSongId = await resolveSongIdBySongmid({ songmid, loginUin });
          if (resolvedSongId) {
            fallbackPayload = await fetchLyricByMusicu({
              songmid,
              songid: resolvedSongId,
              loginUin,
              cookie
            });
          }
        }

        if (Object.keys(fallbackPayload).length > 0 && !hasNegativeBizCode(fallbackPayload)) {
          payload = mergePrimaryAndFallbackPayload(payload, fallbackPayload);
        }
      } catch {
        // keep primary payload when fallback request fails
      }
    }

    return {
      status: 200,
      body: {
        response: normalizeLyricResponse(payload, Boolean(isFormat))
      }
    };
  } catch (error) {
    const normalizedError = error instanceof Error
      ? {
        name: error.name,
        message: error.message
      }
      : {
        name: 'Error',
        message: 'Internal server error'
      };

    return {
      status: 500,
      body: {
        error: normalizedError
      }
    };
  }
};
