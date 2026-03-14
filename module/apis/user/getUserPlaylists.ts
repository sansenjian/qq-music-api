import request from '../../../util/request';
import { customResponse, errorResponse } from '../../../util/apiResponse';
import type { ApiResponse } from '../../../types/api';

interface UserPlaylistItem {
  [key: string]: unknown;
}

const DEBUG_ENABLED = process.env.DEBUG === 'true';

const debugLog = (message: string, payload?: unknown) => {
  if (DEBUG_ENABLED) {
    console.log(`[getUserPlaylists] ${message}`, payload ?? '');
  }
};

const getNamedCandidateEntries = (payload: Record<string, any>) => [
  ['data.mydiss.list', payload?.data?.mydiss?.list],
  ['data.mymusic', payload?.data?.mymusic],
  ['data.createdDissList', payload?.data?.createdDissList],
  ['data.createdList', payload?.data?.createdList],
  ['data.creator', payload?.data?.creator],
  ['data.creator.playlist', payload?.data?.creator?.playlist],
  ['data.creator.playlists', payload?.data?.creator?.playlists],
  ['data.playlist', payload?.data?.playlist],
  ['data.playlists', payload?.data?.playlists],
  ['mydiss.list', payload?.mydiss?.list],
  ['mymusic', payload?.mymusic],
  ['createdDissList', payload?.createdDissList],
  ['createdList', payload?.createdList],
  ['creator', payload?.creator],
  ['creator.playlist', payload?.creator?.playlist],
  ['creator.playlists', payload?.creator?.playlists],
  ['playlist', payload?.playlist],
  ['playlists', payload?.playlists]
] as const;

const extractPlaylists = (payload: Record<string, any>): UserPlaylistItem[] => {
  debugLog('payload top-level keys', Object.keys(payload || {}));
  debugLog('payload.data keys', payload?.data && typeof payload.data === 'object' ? Object.keys(payload.data) : []);

  const matchedEntry = getNamedCandidateEntries(payload).find(([, candidate]) => Array.isArray(candidate));

  if (matchedEntry) {
    const [candidatePath, playlists] = matchedEntry;
    debugLog('matched playlist candidate', {
      candidatePath,
      length: (playlists as unknown[]).length
    });
    return playlists as UserPlaylistItem[];
  }

  debugLog(
    'playlist candidates summary',
    getNamedCandidateEntries(payload).map(([candidatePath, candidate]) => ({
      candidatePath,
      type: Array.isArray(candidate) ? 'array' : typeof candidate,
      keys: candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? Object.keys(candidate) : undefined
    }))
  );

  throw new Error('用户歌单响应中未找到歌单列表字段');
};

const getErrorMessage = (payload: Record<string, any>): string => {
  const candidates = [payload.message, payload.msg, payload.errmsg, payload.error];
  const matched = candidates.find(candidate => typeof candidate === 'string' && candidate.trim() !== '');
  return (matched as string | undefined) || '获取用户歌单失败';
};

// 获取用户创建的歌单
// 注意：此接口需要有效的 QQ 音乐 Cookie 才能正常工作
export const getUserPlaylists = async (params: {
  uin: string;
  offset?: number;
  limit?: number;
  cookie?: string;
}): Promise<ApiResponse> => {
  const { uin, offset = 0, limit = 30, cookie } = params;

  // 使用 c6.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg 接口
  // 这是通过 Chrome DevTools 抓包发现的实际使用的接口
  const url = 'https://c6.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg';
  const pageOffset = offset % limit;

  try {
    debugLog('request meta', {
      url,
      uin,
      offset,
      limit,
      pageOffset,
      hasCookie: Boolean(cookie),
      cookieLength: cookie?.length || 0
    });

    const response = await request<Record<string, any>>({
      url,
      method: 'GET',
      isUUrl: 'u',
      cookie,
      options: {
        params: {
          _: Date.now(),
          cv: 4747474,
          ct: 24,
          format: 'json',
          inCharset: 'utf-8',
          outCharset: 'utf-8',
          notice: 0,
          platform: 'yqq.json',
          needNewCode: 0,
          uin: Number.parseInt(uin, 10),
          g_tk_new_20200303: 0,
          g_tk: 0,
          cid: 205360838,
          userid: Number.parseInt(uin, 10),
          reqfrom: 1,
          reqtype: 0,
          hostUin: 0,
          loginUin: Number.parseInt(uin, 10)
        },
        headers: {
          Referer: `https://y.qq.com/portal/profile.html?uin=${uin}`
        }
      }
    });

    const payload = response.data;

    debugLog('upstream payload summary', {
      topLevelKeys: payload && typeof payload === 'object' ? Object.keys(payload) : null,
      code: payload?.code,
      hasData: Boolean(payload?.data),
      dataKeys: payload?.data && typeof payload.data === 'object' ? Object.keys(payload.data) : []
    });

    if (!payload || typeof payload !== 'object') {
      debugLog('invalid payload received', payload);
      return errorResponse('用户歌单响应格式无效', 502);
    }

    if (typeof payload.code === 'number' && payload.code !== 0) {
      debugLog('upstream business error payload', payload);
      return errorResponse(getErrorMessage(payload), 502);
    }

    const upstreamPlaylists = extractPlaylists(payload);
    const playlists = pageOffset > 0 ? upstreamPlaylists.slice(pageOffset, pageOffset + limit) : upstreamPlaylists;

    debugLog('final response contract', {
      wrapper: 'customResponse',
      expectedBodyShape: { response: { code: 0, data: { playlists: '...' } } },
      upstreamLength: upstreamPlaylists.length,
      normalizedLength: playlists.length
    });

    return customResponse({ response: { code: 0, data: { playlists } } }, 200);
  } catch (error) {
    console.error('获取用户歌单失败:', error);
    return errorResponse((error as Error).message || '获取用户歌单失败', 502);
  }
};

