/**
 * 歌单浏览历史和收藏管理工具
 * 使用 localStorage 存储用户数据
 */

const HISTORY_KEY = 'userMusicHistory'
const COLLECTED_KEY = 'collectedPlaylists'
const VIEW_HISTORY_KEY = 'playlistViewHistory'

/**
 * 获取用户音乐历史（包含偏好标签等）
 * @returns {Object} 用户历史数据
 */
export function getUserHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : { tags: [], playHistory: [] }
  } catch (e) {
    console.error('获取用户历史失败:', e)
    return { tags: [], playHistory: [] }
  }
}

/**
 * 保存用户音乐历史
 * @param {Object} history 历史数据
 */
export function saveUserHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('保存用户历史失败:', e)
  }
}

/**
 * 添加用户偏好标签
 * @param {string} tag 标签
 */
export function addUserTag(tag) {
  const history = getUserHistory()
  history.tags = history.tags || []
  
  if (!history.tags.includes(tag)) {
    history.tags.push(tag)
    // 限制标签数量最多20个
    if (history.tags.length > 20) {
      history.tags.shift()
    }
    saveUserHistory(history)
  }
}

/**
 * 添加多个用户偏好标签
 * @param {string[]} tags 标签数组
 */
export function addUserTags(tags) {
  const history = getUserHistory()
  history.tags = history.tags || []
  
  tags.forEach(tag => {
    if (!history.tags.includes(tag)) {
      history.tags.push(tag)
    }
  })
  
  // 限制标签数量
  if (history.tags.length > 20) {
    history.tags = history.tags.slice(-20)
  }
  
  saveUserHistory(history)
}

/**
 * 获取收藏的歌单列表
 * @returns {Array} 收藏的歌单数组
 */
export function getCollectedPlaylists() {
  try {
    const data = localStorage.getItem(COLLECTED_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('获取收藏歌单失败:', e)
    return []
  }
}

/**
 * 保存收藏的歌单
 * @param {Object} playlist 歌单对象
 */
export function saveCollectedPlaylist(playlist) {
  try {
    const collected = getCollectedPlaylists()
    
    // 检查是否已收藏
    const exists = collected.some(p => p.id === playlist.id)
    if (exists) {
      return false
    }
    
    // 添加收藏时间
    const playlistWithTime = {
      ...playlist,
      collectedAt: new Date().toISOString()
    }
    
    collected.unshift(playlistWithTime)
    localStorage.setItem(COLLECTED_KEY, JSON.stringify(collected))
    
    // 同时更新用户标签
    if (playlist.tags && playlist.tags.length) {
      addUserTags(playlist.tags)
    }
    
    return true
  } catch (e) {
    console.error('保存收藏歌单失败:', e)
    return false
  }
}

/**
 * 移除收藏的歌单
 * @param {string|number} playlistId 歌单ID
 */
export function removeCollectedPlaylist(playlistId) {
  try {
    const collected = getCollectedPlaylists()
    const filtered = collected.filter(p => p.id !== playlistId)
    localStorage.setItem(COLLECTED_KEY, JSON.stringify(filtered))
    return true
  } catch (e) {
    console.error('移除收藏歌单失败:', e)
    return false
  }
}

/**
 * 检查歌单是否已收藏
 * @param {string|number} playlistId 歌单ID
 * @returns {boolean} 是否已收藏
 */
export function isPlaylistCollected(playlistId) {
  const collected = getCollectedPlaylists()
  return collected.some(p => p.id === playlistId)
}

/**
 * 获取浏览历史
 * @returns {Array} 浏览历史数组
 */
export function getViewHistory() {
  try {
    const data = localStorage.getItem(VIEW_HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('获取浏览历史失败:', e)
    return []
  }
}

/**
 * 添加浏览记录
 * @param {Object} playlist 歌单信息
 */
export function addViewHistory(playlist) {
  try {
    const history = getViewHistory()
    
    const record = {
      id: playlist.id,
      name: playlist.name,
      tags: playlist.tags || [],
      coverImgUrl: playlist.coverImgUrl,
      viewTime: new Date().toISOString()
    }
    
    // 移除重复记录
    const index = history.findIndex(h => h.id === playlist.id)
    if (index > -1) {
      history.splice(index, 1)
    }
    
    // 添加到开头，限制最多50条
    history.unshift(record)
    if (history.length > 50) {
      history.pop()
    }
    
    localStorage.setItem(VIEW_HISTORY_KEY, JSON.stringify(history))
    
    // 更新用户标签
    if (playlist.tags && playlist.tags.length) {
      addUserTags(playlist.tags)
    }
    
    return true
  } catch (e) {
    console.error('添加浏览记录失败:', e)
    return false
  }
}

/**
 * 清除浏览历史
 */
export function clearViewHistory() {
  try {
    localStorage.removeItem(VIEW_HISTORY_KEY)
    return true
  } catch (e) {
    console.error('清除浏览历史失败:', e)
    return false
  }
}

/**
 * 清除所有歌单相关数据
 */
export function clearAllPlaylistData() {
  try {
    localStorage.removeItem(HISTORY_KEY)
    localStorage.removeItem(COLLECTED_KEY)
    localStorage.removeItem(VIEW_HISTORY_KEY)
    return true
  } catch (e) {
    console.error('清除歌单数据失败:', e)
    return false
  }
}

/**
 * 记录歌曲播放历史
 * @param {Object} song 歌曲信息
 */
export function addPlayHistory(song) {
  try {
    const history = getUserHistory()
    history.playHistory = history.playHistory || []
    
    const record = {
      id: song.id,
      name: song.name,
      artist: song.ar || song.artists,
      album: song.al || song.album,
      playTime: new Date().toISOString()
    }
    
    // 移除重复记录
    const index = history.playHistory.findIndex(h => h.id === song.id)
    if (index > -1) {
      history.playHistory.splice(index, 1)
    }
    
    // 添加到开头，限制最多100条
    history.playHistory.unshift(record)
    if (history.playHistory.length > 100) {
      history.playHistory.pop()
    }
    
    saveUserHistory(history)
    return true
  } catch (e) {
    console.error('添加播放历史失败:', e)
    return false
  }
}
