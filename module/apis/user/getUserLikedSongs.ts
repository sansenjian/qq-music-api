import request from '../../../util/request';
import { customResponse, errorResponse } from '../../../util/apiResponse';
import type { ApiResponse } from '../../../types/api';

interface LikedSong {
  [key: string]: unknown;
}

const DEBUG_ENABLED = process.env.DEBUG === 'true';

const debugLog = (message: string, payload?: unknown) => {
  if (DEBUG_ENABLED) {
    console.log(`[getUserLikedSongs] ${message}`, payload ?? '');
  }
};

// 获取用户喜欢的歌曲列表
// 注意：此接口需要有效的 QQ 音乐 Cookie 才能正常工作
export const getUserLikedSongs = async (params: {
  uin: string;
  offset?: number;
  limit?: number;
}): Promise<ApiResponse> => {
  const { uin, offset = 0, limit = 30 } = params;
  const page = Math.floor(offset / limit) + 1;

  // 使用 c6.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg 接口
  // 通过 mymusic 字段获取用户喜欢的歌曲信息
  const url = 'https://c6.y.qq.com/rsc/fcgi-bin/fcg_get_profile_homepage.fcg';

  try {
    debugLog('request meta', {
      url,
      uin,
      offset,
      limit,
      page,
      hasGlobalCookie: Boolean(global.userInfo?.cookie),
      cookieLength: global.userInfo?.cookie?.length || 0
    });

    const response = await request<Record<string, any>>({
      url,
      method: 'GET',
      isUUrl: 'u',
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
          Referer: `https://y.qq.com/portal/profile.html?uin=${uin}`,
          Cookie: global.userInfo?.cookie || ''
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
      return errorResponse('用户喜欢的歌曲响应格式无效', 502);
    }

    if (typeof payload.code === 'number' && payload.code !== 0) {
      debugLog('upstream business error payload', payload);
      return errorResponse(payload.msg || payload.message || '获取用户喜欢的歌曲失败', 502);
    }

    // 从 mymusic 字段中提取喜欢的歌曲信息
    // mymusic 数组中的第一个元素通常包含"我喜欢"歌单的信息
    const mymusic = payload?.data?.mymusic;
    let likedSongsInfo = null;

    if (Array.isArray(mymusic)) {
      // 查找"我喜欢"歌单（通常 title 包含"喜欢"或 type 为 1）
      likedSongsInfo = mymusic.find((item: any) => {
        return item?.title && (item.title.includes('喜欢') || item.type === 1);
      });
    }

    debugLog('liked songs info', likedSongsInfo);

    if (!likedSongsInfo) {
      debugLog('no liked songs info found in mymusic');
      return customResponse({ 
        response: { 
          code: 0, 
          data: { 
            songs: [],
            total: 0,
            hasMore: false
          } 
        } 
      }, 200);
    }

    // 返回喜欢的歌曲信息（包含歌单 ID 和统计信息）
    // 注意：完整的歌曲列表需要通过 musics.fcg 接口获取（需要二进制加密）
    // 这里先返回歌单基本信息
    return customResponse({ 
      response: { 
        code: 0, 
        data: { 
          songs: [likedSongsInfo],
          total: likedSongsInfo.num0 || 0,
          hasMore: false,
          info: {
            title: likedSongsInfo.title,
            songCount: likedSongsInfo.num0,
            albumCount: likedSongsInfo.num1,
            playlistCount: likedSongsInfo.num2,
            id: likedSongsInfo.id
          }
        } 
      } 
    }, 200);
  } catch (error) {
    console.error('获取用户喜欢的歌曲失败:', error);
    return errorResponse((error as Error).message || '获取用户喜欢的歌曲失败', 502);
  }
};
