import { commonParams } from '../../config'
import uCommon from '../u_common'
import { handleApi } from '../../../util/apiResponse'

const PERSONAL_RECOMMEND_CONFIG = {
  1: {
    key: 'recomPlaylist',
    method: 'get_recommend',
    module: 'music.web_srf_svr',
    param: {
      page: 0,
      num: 20,
      uin: 0,
      login: 0
    }
  },
  2: {
    key: 'radio',
    method: 'get_radio_list',
    module: 'pf.radiosvr',
    param: {
      page_offset: 1,
      page_size: 20
    }
  },
  3: {
    key: 'mv',
    method: 'GetRecommendMV',
    module: 'gosrf.Stream.MvUrlProxy',
    param: {
      size: 20
    }
  }
} as const

const DEFAULT_PERSONAL_RECOMMEND_TYPE = 1
const DEFAULT_SIMILAR_SONG_LIMIT = 20

function resolveRecommendConfig(type: number) {
  return PERSONAL_RECOMMEND_CONFIG[
    type as keyof typeof PERSONAL_RECOMMEND_CONFIG
  ] || PERSONAL_RECOMMEND_CONFIG[DEFAULT_PERSONAL_RECOMMEND_TYPE]
}

/**
 * 获取个性化推荐
 * @param type - 推荐类型 (1: 歌单，2: 电台，3: MV)
 * @param cookie - 用户 Cookie
 * @returns 推荐列表
 */
export async function getPersonalRecommend(type: number = 1, cookie?: string) {
  const recommendConfig = resolveRecommendConfig(type)
  const data = {
    comm: {
      ...commonParams,
      ct: 24,
      cv: 0
    },
    [recommendConfig.key]: {
      method: recommendConfig.method,
      module: recommendConfig.module,
      param: recommendConfig.param
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
 * 获取相似歌曲推荐
 * @param songmid - 歌曲 MID
 * @param cookie - 用户 Cookie
 * @returns 相似歌曲列表
 */
export async function getSimilarSongs(songmid: string, cookie?: string) {
  const data = {
    comm: {
      ...commonParams,
      ct: 24,
      cv: 0
    },
    similarSong: {
      method: 'get_similar_song_info',
      module: 'music.web_srf_svr',
      param: {
        songid: 0,
        songmid,
        num: DEFAULT_SIMILAR_SONG_LIMIT
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

export default {
  getPersonalRecommend,
  getSimilarSongs
}
