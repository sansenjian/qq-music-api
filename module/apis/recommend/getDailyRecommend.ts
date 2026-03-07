import { commonParams } from '../../config'
import uCommon from '../u_common'
import { handleApi } from '../../../util/apiResponse'

const DEFAULT_NEW_SONG_TYPE = 5
const NEW_SONG_LIMIT_BY_TYPE: Record<number, number> = {
  1: 20,
  2: 20,
  3: 20,
  4: 20,
  5: 20
}

function normalizeNewSongType(areaId: number) {
  return Number.isInteger(areaId) && areaId >= 1 && areaId <= 5
    ? areaId
    : DEFAULT_NEW_SONG_TYPE
}

/**
 * 获取每日推荐歌曲
 * @param cookie - 用户 Cookie（可选，用于获取个性化推荐）
 * @returns 每日推荐歌曲列表
 */
export async function getDailyRecommend(cookie?: string) {
  const data = {
    comm: {
      ...commonParams,
      ct: 24,
      cv: 0
    },
    recommend: {
      method: 'get_recommend',
      module: 'music.web_srf_svr',
      param: {
        page: 0,
        num: 20,
        uin: 0,
        login: 0
      }
    }
  }

  return handleApi(
    uCommon({
      method: 'POST',
      options: {
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          cookie
        }
      }
    })
  )
}

/**
 * 获取私人 FM
 * @param cookie - 用户 Cookie
 * @returns 私人 FM 歌曲列表
 */
export async function getPrivateFM(cookie?: string) {
  const data = {
    comm: {
      ...commonParams,
      ct: 24,
      cv: 0
    },
    fm: {
      method: 'GetPrivateFmPlaylist',
      module: 'music.web_fm_svr',
      param: {
        enc: 'utf8',
        moter: 0,
        uin: 0,
        login: 0
      }
    }
  }

  return handleApi(
    uCommon({
      method: 'POST',
      options: {
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          cookie
        }
      }
    })
  )
}

/**
 * 获取新歌速递
 * @param areaId - 地区 ID（兼容旧参数，当前映射到新歌类型，暂定映射关系）
 * @param limit - 返回数量（当前上游接口固定类型，limit 仅用于兼容入参）
 * @returns 新歌列表
 */
export async function getNewSongs(areaId: number = DEFAULT_NEW_SONG_TYPE, limit: number = 20) {
  const normalizedType = normalizeNewSongType(areaId)
  const normalizedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20

  const data = {
    comm: {
      ...commonParams,
      ct: 24,
      cv: 0
    },
    new_song: {
      module: 'newsong.NewSongServer',
      method: 'get_new_song_info',
      param: {
        type: normalizedType,
        num: normalizedLimit || NEW_SONG_LIMIT_BY_TYPE[normalizedType]
      }
    }
  }

  return handleApi(
    uCommon({
      method: 'POST',
      options: {
        data: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    })
  )
}

export default {
  getDailyRecommend,
  getPrivateFM,
  getNewSongs
}
