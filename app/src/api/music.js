import axios from 'axios'

/**
 * 搜索歌曲
 * @param {string} keywords 搜索关键词
 * @param {number} limit 返回数量限制，默认30
 * @returns {Promise} 搜索结果
 */
export function searchSong(keywords, limit = 30) {
  return axios.get('/search', {
    params: {
      keywords,
      limit,
      type: 1 // 搜索类型：1-单曲
    }
  })
}

/**
 * 获取歌曲详情
 * @param {string} ids 歌曲ID，多个用逗号分隔
 * @returns {Promise} 歌曲详情
 */
export function getSongDetail(ids) {
  return axios.get('/song/detail', {
    params: {
      ids
    }
  })
}

/**
 * 获取歌曲URL
 * @param {string} id 歌曲ID
 * @returns {Promise} 歌曲URL
 */
export function getSongUrl(id) {
  return axios.get('/song/url', {
    params: {
      id
    }
  })
}
