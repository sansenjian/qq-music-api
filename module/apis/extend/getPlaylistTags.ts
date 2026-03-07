import { commonParams } from '../../config'
import uCommon from '../u_common'
import { handleApi } from '../../../util/apiResponse'

/**
 * 获取歌单标签列表
 * @returns 歌单标签列表
 */
export async function getPlaylistTags() {
  const data = {
    comm: {
      ...commonParams,
      ct: 24,
      cv: 0
    },
    playlist: {
      method: 'get_tags',
      module: 'playlist.web_srf',
      param: {}
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

/**
 * 根据标签获取歌单列表
 * @param tagId - 标签 ID
 * @param page - 页码
 * @param num - 每页数量
 * @returns 歌单列表
 */
export async function getPlaylistsByTag(tagId: number = 1, page: number = 0, num: number = 20) {
  const data = {
    comm: {
      ...commonParams,
      ct: 24,
      cv: 0
    },
    playlist: {
      method: 'get_playlist_by_tag',
      module: 'playlist.web_srf',
      param: {
        tag_id: tagId,
        rec_type: 3,
        show_list: 1,
        sort: 1,
        user_id: 0,
        page: page,
        num: num
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

/**
 * 获取热门评论
 * @param id - 资源 ID（歌曲/歌单/专辑 ID）
 * @param type - 资源类型 (1: 歌曲，2: 歌单，3: 专辑)
 * @param page - 页码
 * @param pagesize - 每页数量
 * @returns 评论列表
 */
export async function getHotComments(id: string, type: number = 1, page: number = 0, pagesize: number = 20) {
  const data = {
    comm: {
      ...commonParams,
      ct: 24,
      cv: 0
    },
    comment: {
      module: 'comment.CommentReadServer',
      method: 'GetCommentList',
      param: {
        biztype: type,
        bizid: id,
        page: page,
        pagesize: pagesize,
        needhot: 1
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

/**
 * 获取歌手分类列表
 * @param area - 地区 (1: 内地，2: 港台，3: 欧美，4: 韩国，5: 日本)
 * @param sex - 性别 (1: 男歌手，2: 女歌手，3: 组合)
 * @param genre - 流派 (1: 流行，2: 摇滚，3: 民谣等)
 * @param page - 页码
 * @param pagesize - 每页数量
 * @returns 歌手列表
 */
export async function getSingerListByArea(
  area: number = -1,
  sex: number = -1,
  genre: number = -1,
  page: number = 1,
  pagesize: number = 80
) {
  const data = {
    comm: {
      ...commonParams,
      ct: 24,
      cv: 0
    },
    singer: {
      method: 'get_singer_list',
      module: 'music.web_srf_svr',
      param: {
        area: area,
        sex: sex,
        genre: genre,
        page: page,
        pagesize: pagesize
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
  getPlaylistTags,
  getPlaylistsByTag,
  getHotComments,
  getSingerListByArea
}
