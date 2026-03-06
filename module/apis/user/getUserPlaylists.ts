import request from '../../../util/request';
import { customResponse, errorResponse } from '../../../util/apiResponse';
import type { ApiResponse } from '../../../types/api';

interface UserPlaylistItem {
  [key: string]: unknown;
}

interface UserPlaylistsPayload {
  playlists: UserPlaylistItem[];
  raw: Record<string, unknown>;
}

const DEBUG_ENABLED = process.env.DEBUG === 'true';

const debugLog = (message: string, payload?: unknown) => {
  if (DEBUG_ENABLED) {
    console.log(`[getUserPlaylists] ${message}`, payload ?? '');
  }
};

const getNamedCandidateEntries = (payload: Record<string, any>) => [
  ['data.mymusic', payload?.data?.mymusic],
  ['data.createdDissList', payload?.data?.createdDissList],
  ['data.createdList', payload?.data?.createdList],
  ['data.creator', payload?.data?.creator],
  ['data.creator.playlist', payload?.data?.creator?.playlist],
  ['data.creator.playlists', payload?.data?.creator?.playlists],
  ['data.playlist', payload?.data?.playlist],
  ['data.playlists', payload?.data?.playlists],
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
}): Promise<ApiResponse> => {
  const { uin, offset = 0, limit = 30 } = params;

  const url = 'https://c.y.qq.com/musicu/fcg-bin/fcg_get_profile_homepage.fcg';

  const data = {
    format: 'json',
    platform: 'yqq',
    ct: 20,
    uin,
    userid: uin,
    reqfrom: 1,
    reqtype: 0,
    skip: offset,
    num: limit
  };

  try {
    const response = await request<Record<string, any>>(url, 'GET', {
      params: data,
      headers: {
        Referer: `https://y.qq.com/portal/profile.html?uin=${uin}`,
        Cookie: global.userInfo?.cookie || ''
      }
    }, 'u');

    const payload = response.data;

    if (!payload || typeof payload !== 'object') {
      debugLog('invalid payload received', payload);
      return errorResponse('用户歌单响应格式无效', 502);
    }

    if (typeof payload.code === 'number' && payload.code !== 0) {
      debugLog('upstream business error payload', payload);
      return errorResponse(getErrorMessage(payload), 502);
    }

    const responseData: UserPlaylistsPayload = {
      playlists: extractPlaylists(payload),
      raw: payload
    };

    return customResponse({ code: 0, data: responseData }, 200);
  } catch (error) {
    console.error('获取用户歌单失败:', error);
    return errorResponse((error as Error).message || '获取用户歌单失败', 502);
  }
};

