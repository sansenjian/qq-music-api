import type { Method } from 'axios';
import UCommon from '../UCommon/UCommon';
import { _guid } from '../../config';
import { extractUinFromCookie } from '../../../util/cookieResolver';
import type { ApiOptions, ApiResponse } from '../../../types/api';

type AudioQuality = 'm4a' | '128' | '320' | 'ape' | 'flac';

interface MidUrlInfo {
  songmid?: string;
  purl?: string;
  filename?: string;
  vkey?: string;
}

interface GetMusicPlayParams {
  songmid?: string | string[];
  resType?: string | string[];
  mediaId?: string | string[];
  quality?: string | number | string[];
}

const DEFAULT_QUALITY: AudioQuality = '128';

const FILE_TYPE_MAP: Record<AudioQuality, { prefix: string; suffix: string }> = {
  m4a: { prefix: 'C400', suffix: '.m4a' },
  128: { prefix: 'M500', suffix: '.mp3' },
  320: { prefix: 'M800', suffix: '.mp3' },
  ape: { prefix: 'A000', suffix: '.ape' },
  flac: { prefix: 'F000', suffix: '.flac' }
};

const normalizeFirstValue = (value: unknown): string | undefined => {
  if (Array.isArray(value)) {
    return normalizeFirstValue(value[0]);
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized || undefined;
};

const normalizeSongmidList = (songmid: unknown): string[] => {
  const values = Array.isArray(songmid) ? songmid : [songmid];

  return values
    .flatMap(value => {
      if (typeof value !== 'string') return [];
      return value.split(',');
    })
    .map(item => item.trim())
    .filter(Boolean);
};

const normalizeQuality = (value: unknown): AudioQuality => {
  const quality = normalizeFirstValue(value) || String(value || '');

  if (quality === 'm4a' || quality === 'ape' || quality === 'flac') {
    return quality;
  }

  const numericQuality = Number(quality);
  if (numericQuality === 320) {
    return '320';
  }

  if (numericQuality === 128) {
    return '128';
  }

  return DEFAULT_QUALITY;
};

const pickPlayableDomain = (sip: unknown): string => {
  if (!Array.isArray(sip)) return '';
  const urls = sip.filter((item): item is string => typeof item === 'string' && item.length > 0);
  return (
    urls.find(url => !url.startsWith('http://ws')) ||
    urls.find(url => url.startsWith('https://')) ||
    urls[0] ||
    ''
  );
};

const joinUrl = (domain: string, path: string): string => {
  if (domain.endsWith('/') && path.startsWith('/')) {
    return `${domain}${path.slice(1)}`;
  }

  if (!domain.endsWith('/') && !path.startsWith('/')) {
    return `${domain}/${path}`;
  }

  return `${domain}${path}`;
};

const buildPlayUrl = (domain: string, info: MidUrlInfo, guid: string): string => {
  if (!domain) return '';

  if (info.purl) {
    return joinUrl(domain, info.purl);
  }

  // Fallback for payloads where purl is empty but vkey/filename are present.
  if (info.vkey && info.filename) {
    return `${joinUrl(domain, info.filename)}?vkey=${info.vkey}&guid=${guid}&fromtag=66`;
  }

  return '';
};

const resolveUin = (cookie?: string): string => {
  const defaultUin = String((global as any).userInfo?.uin || (global as any).userInfo?.loginUin || '0');
  return extractUinFromCookie(cookie) || defaultUin;
};

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

export default async ({
  method = 'get',
  params = {},
  option = {}
}: ApiOptions): Promise<ApiResponse> => {
  const musicParams = params as GetMusicPlayParams;
  const songmidList = normalizeSongmidList(musicParams.songmid);

  if (songmidList.length === 0) {
    return {
      status: 400,
      body: {
        data: {
          message: 'no songmid'
        }
      }
    };
  }

  const justPlayUrl = (normalizeFirstValue(musicParams.resType) || 'play') === 'play';
  const mediaId = normalizeFirstValue(musicParams.mediaId);
  const quality = normalizeQuality(musicParams.quality);
  const guid = String(_guid || '1429839143');
  const cookie = getCookieFromOptions(option);
  const uin = resolveUin(cookie);
  const fileType = FILE_TYPE_MAP[quality];
  const filename = songmidList.map(item => `${fileType.prefix}${item}${mediaId || item}${fileType.suffix}`);

  const requestPayload = {
    req_0: {
      module: 'vkey.GetVkeyServer',
      method: 'CgiGetVkey',
      param: {
        filename,
        guid,
        songmid: songmidList,
        songtype: [0],
        uin,
        loginflag: 1,
        platform: '20'
      }
    },
    loginUin: uin,
    comm: {
      uin,
      format: 'json',
      ct: 24,
      cv: 0
    }
  };

  const upstreamParams = {
    format: 'json',
    sign: 'zzannc1o6o9b4i971602f3554385022046ab796512b7012',
    data: JSON.stringify(requestPayload)
  };

  try {
    const response = await UCommon({
      method: method as Method,
      params: upstreamParams,
      option
    });

    const upstreamData = response.data as Record<string, any>;
    const domain = pickPlayableDomain(upstreamData?.req_0?.data?.sip);
    const midurlinfo = Array.isArray(upstreamData?.req_0?.data?.midurlinfo)
      ? (upstreamData.req_0.data.midurlinfo as MidUrlInfo[])
      : [];

    const playUrl: Record<string, { url: string; error?: string }> = {};
    const midInfoMap = new Map<string, MidUrlInfo>();

    midurlinfo.forEach(item => {
      if (item.songmid) {
        midInfoMap.set(item.songmid, item);
      }
    });

    songmidList.forEach(songmid => {
      const item = midInfoMap.get(songmid);
      const url = item ? buildPlayUrl(domain, item, guid) : '';
      playUrl[songmid] = {
        url,
        error: url ? undefined : '\u6682\u65e0\u64ad\u653e\u94fe\u63a5'
      };
    });

    upstreamData.playUrl = playUrl;

    return {
      status: 200,
      body: {
        data: justPlayUrl ? { playUrl } : upstreamData
      }
    };
  } catch (error) {
    return {
      status: 502,
      body: {
        error: error instanceof Error ? error.message : error
      }
    };
  }
};
