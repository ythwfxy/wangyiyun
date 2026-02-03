/**
 * 歌单广场 MOCK 数据
 * 用于演示个性化推荐功能
 */

// 使用可靠的占位图片服务
const getCoverUrl = (id) => {
  // 使用 picsum 随机图片服务，基于id生成固定图片
  return `https://picsum.photos/seed/${id}/300/300`
}

export const mockPlaylists = [
  {
    id: 1001,
    name: '华语流行金曲精选',
    coverImgUrl: getCoverUrl(1001),
    playCount: 125680000,
    creator: '音乐精选君',
    tags: ['流行', '华语', '经典'],
    updateTime: '2024-01-15',
    description: '精选华语流行金曲，带你重温经典时刻'
  },
  {
    id: 1002,
    name: '深夜电台 · 治愈系民谣',
    coverImgUrl: getCoverUrl(1002),
    playCount: 89200000,
    creator: '民谣小站',
    tags: ['民谣', '治愈', '华语'],
    updateTime: '2024-01-20',
    description: '深夜里的温暖陪伴，治愈心灵的民谣精选'
  },
  {
    id: 1003,
    name: '欧美流行热歌榜',
    coverImgUrl: getCoverUrl(1003),
    playCount: 234500000,
    creator: 'Billboard中文',
    tags: ['流行', '欧美', '热歌'],
    updateTime: '2024-01-22',
    description: 'Billboard热歌精选，欧美流行音乐风向标'
  },
  {
    id: 1004,
    name: '电子音乐派对精选',
    coverImgUrl: getCoverUrl(1004),
    playCount: 56700000,
    creator: 'EDM China',
    tags: ['电子', '舞曲', '欧美'],
    updateTime: '2024-01-18',
    description: 'High翻全场的电子音乐，派对必备'
  },
  {
    id: 1005,
    name: '日系动漫经典OST',
    coverImgUrl: getCoverUrl(1005),
    playCount: 78900000,
    creator: '二次元音乐馆',
    tags: ['动漫', '日语', 'OST'],
    updateTime: '2024-01-21',
    description: '那些年我们一起追过的动漫主题曲'
  },
  {
    id: 1006,
    name: '摇滚不死 · 经典永恒',
    coverImgUrl: getCoverUrl(1006),
    playCount: 45600000,
    creator: '摇滚老炮',
    tags: ['摇滚', '经典', '欧美'],
    updateTime: '2024-01-16',
    description: '摇滚精神永存，致敬经典摇滚乐队'
  },
  {
    id: 1007,
    name: '轻音乐 · 专注学习',
    coverImgUrl: getCoverUrl(1007),
    playCount: 156700000,
    creator: '专注音乐室',
    tags: ['轻音乐', '学习', '纯音乐'],
    updateTime: '2024-01-23',
    description: '提高专注力的轻音乐，学习工作必备'
  },
  {
    id: 1008,
    name: 'K-POP热门精选',
    coverImgUrl: getCoverUrl(1008),
    playCount: 198900000,
    creator: '韩流音乐站',
    tags: ['韩语', '流行', 'K-POP'],
    updateTime: '2024-01-22',
    description: '最新最热的K-POP歌曲一网打尽'
  },
  {
    id: 1009,
    name: '古风歌曲精选集',
    coverImgUrl: getCoverUrl(1009),
    playCount: 67800000,
    creator: '古风音乐社',
    tags: ['古风', '华语', '国风'],
    updateTime: '2024-01-19',
    description: '古韵悠扬，唯美古风歌曲精选'
  },
  {
    id: 1010,
    name: '爵士下午茶',
    coverImgUrl: getCoverUrl(1010),
    playCount: 34500000,
    creator: '爵士咖啡馆',
    tags: ['爵士', '欧美', '休闲'],
    updateTime: '2024-01-17',
    description: '慵懒午后，一杯咖啡配爵士'
  },
  {
    id: 1011,
    name: '说唱新势力',
    coverImgUrl: getCoverUrl(1011),
    playCount: 89200000,
    creator: '说唱工厂',
    tags: ['说唱', '嘻哈', '华语'],
    updateTime: '2024-01-20',
    description: '中文说唱新势力，态度与节奏并存'
  },
  {
    id: 1012,
    name: '经典粤语金曲',
    coverImgUrl: getCoverUrl(1012),
    playCount: 112300000,
    creator: '粤语经典',
    tags: ['粤语', '经典', '华语'],
    updateTime: '2024-01-14',
    description: '港乐黄金年代，经典粤语歌曲回顾'
  },
  {
    id: 1013,
    name: '独立音乐人推荐',
    coverImgUrl: getCoverUrl(1013),
    playCount: 23400000,
    creator: '独立音乐志',
    tags: ['独立', '民谣', '小众'],
    updateTime: '2024-01-21',
    description: '发掘独立音乐宝藏，听见不一样的声音'
  },
  {
    id: 1014,
    name: '运动健身BGM',
    coverImgUrl: getCoverUrl(1014),
    playCount: 145600000,
    creator: '健身音乐台',
    tags: ['运动', '电子', '欧美'],
    updateTime: '2024-01-23',
    description: '节奏感超强的运动音乐，激发你的潜能'
  },
  {
    id: 1015,
    name: '钢琴纯音乐',
    coverImgUrl: getCoverUrl(1015),
    playCount: 87600000,
    creator: '钢琴诗人',
    tags: ['钢琴', '纯音乐', '轻音乐'],
    updateTime: '2024-01-18',
    description: '黑白键上的旋律，钢琴纯音乐精选'
  },
  {
    id: 1016,
    name: '90后青春回忆',
    coverImgUrl: getCoverUrl(1016),
    playCount: 156800000,
    creator: '青春纪念册',
    tags: ['流行', '华语', '经典'],
    updateTime: '2024-01-15',
    description: '属于90后的青春记忆，那些年听过的歌'
  },
  {
    id: 1017,
    name: '拉丁风情音乐',
    coverImgUrl: getCoverUrl(1017),
    playCount: 45600000,
    creator: '拉丁音乐盒',
    tags: ['拉丁', '欧美', '舞曲'],
    updateTime: '2024-01-19',
    description: '热情似火的拉丁音乐，感受南美风情'
  },
  {
    id: 1018,
    name: 'R&B灵魂乐',
    coverImgUrl: getCoverUrl(1018),
    playCount: 67800000,
    creator: 'Soul Music',
    tags: ['R&B', '灵魂乐', '欧美'],
    updateTime: '2024-01-20',
    description: '深情款款的R&B，触动灵魂的声音'
  },
  {
    id: 1019,
    name: '国风电子融合',
    coverImgUrl: getCoverUrl(1019),
    playCount: 38900000,
    creator: '新国风音乐',
    tags: ['国风', '电子', '华语'],
    updateTime: '2024-01-22',
    description: '传统与现代的碰撞，国风电子新体验'
  },
  {
    id: 1020,
    name: '睡前放松音乐',
    coverImgUrl: getCoverUrl(1020),
    playCount: 123400000,
    creator: '睡眠音乐馆',
    tags: ['轻音乐', '放松', '纯音乐'],
    updateTime: '2024-01-23',
    description: '舒缓放松的睡前音乐，祝你有个好梦'
  },
  {
    id: 1021,
    name: '重金属精选',
    coverImgUrl: getCoverUrl(1021),
    playCount: 23400000,
    creator: '金属狂潮',
    tags: ['金属', '摇滚', '欧美'],
    updateTime: '2024-01-16',
    description: '震撼心灵的重金属音乐，释放你的激情'
  },
  {
    id: 1022,
    name: '日系摇滚精选',
    coverImgUrl: getCoverUrl(1022),
    playCount: 56700000,
    creator: 'J-Rock Station',
    tags: ['摇滚', '日语', 'J-Rock'],
    updateTime: '2024-01-21',
    description: '日本摇滚精选，感受J-Rock的独特魅力'
  },
  {
    id: 1023,
    name: '蓝调布鲁斯',
    coverImgUrl: getCoverUrl(1023),
    playCount: 18900000,
    creator: '蓝调酒吧',
    tags: ['蓝调', '布鲁斯', '欧美'],
    updateTime: '2024-01-17',
    description: '醇厚的蓝调音乐，品味生活的苦涩与甘甜'
  },
  {
    id: 1024,
    name: '儿童歌曲精选',
    coverImgUrl: getCoverUrl(1024),
    playCount: 67800000,
    creator: '儿歌乐园',
    tags: ['儿歌', '华语', '教育'],
    updateTime: '2024-01-18',
    description: '经典儿童歌曲，陪伴孩子快乐成长'
  },
  {
    id: 1025,
    name: '电影原声精选',
    coverImgUrl: getCoverUrl(1025),
    playCount: 98700000,
    creator: '电影音乐馆',
    tags: ['OST', '电影', '原声'],
    updateTime: '2024-01-22',
    description: '经典电影配乐，重温银幕感动'
  },
  {
    id: 1026,
    name: '游戏音乐精选',
    coverImgUrl: getCoverUrl(1026),
    playCount: 45600000,
    creator: '游戏音乐站',
    tags: ['游戏', 'OST', '电子'],
    updateTime: '2024-01-20',
    description: '经典游戏配乐，唤醒你的游戏记忆'
  },
  {
    id: 1027,
    name: '婚礼进行曲',
    coverImgUrl: getCoverUrl(1027),
    playCount: 34500000,
    creator: '婚礼音乐师',
    tags: ['婚礼', '古典', '浪漫'],
    updateTime: '2024-01-19',
    description: '浪漫婚礼音乐，见证幸福时刻'
  },
  {
    id: 1028,
    name: '车载音乐精选',
    coverImgUrl: getCoverUrl(1028),
    playCount: 156700000,
    creator: '车载音乐台',
    tags: ['流行', '欧美', '车载'],
    updateTime: '2024-01-23',
    description: '适合开车时听的音乐，让旅途不再枯燥'
  }
]

/**
 * 获取热门歌单（按播放量排序）
 * @param {number} limit 数量限制
 * @returns {Array} 热门歌单数组
 */
export function getPopularPlaylists(limit = 10) {
  return [...mockPlaylists]
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, limit)
}

/**
 * 获取最新更新的歌单
 * @param {number} limit 数量限制
 * @returns {Array} 最新歌单数组
 */
export function getLatestPlaylists(limit = 10) {
  return [...mockPlaylists]
    .sort((a, b) => new Date(b.updateTime) - new Date(a.updateTime))
    .slice(0, limit)
}

/**
 * 根据标签筛选歌单
 * @param {string[]} tags 标签数组
 * @param {number} limit 数量限制
 * @returns {Array} 筛选后的歌单数组
 */
export function getPlaylistsByTags(tags, limit = 10) {
  if (!tags || tags.length === 0) {
    return mockPlaylists.slice(0, limit)
  }
  
  const filtered = mockPlaylists.filter(playlist => 
    playlist.tags.some(tag => tags.includes(tag))
  )
  
  // 按匹配度排序
  filtered.sort((a, b) => {
    const aMatch = a.tags.filter(tag => tags.includes(tag)).length
    const bMatch = b.tags.filter(tag => tags.includes(tag)).length
    return bMatch - aMatch
  })
  
  return filtered.slice(0, limit)
}

/**
 * 搜索歌单
 * @param {string} keyword 关键词
 * @returns {Array} 搜索结果
 */
export function searchPlaylists(keyword) {
  if (!keyword) return mockPlaylists
  
  const lowerKeyword = keyword.toLowerCase()
  return mockPlaylists.filter(playlist => 
    playlist.name.toLowerCase().includes(lowerKeyword) ||
    playlist.creator.toLowerCase().includes(lowerKeyword) ||
    playlist.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  )
}

/**
 * 根据ID获取歌单详情
 * @param {string|number} id 歌单ID
 * @returns {Object|null} 歌单详情
 */
export function getPlaylistById(id) {
  return mockPlaylists.find(p => p.id === Number(id)) || null
}
