const COLLECTED_PLAYLISTS_KEY = 'music_collected_playlists'
const mockPlaylists = [
 {
 id: 1,
 name: '周杰伦经典合集',
 coverImgUrl: 'https://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/18686561631358570.jpg',
 playCount: 12580000,
 creator: {
 nickname: '音乐达人',
 avatarDetail: null
 },
 tags: ['华语', '流行', '经典'],
 updateTime: Date.now() - 86400000 * 2,
 description: '周杰伦经典歌曲合集，回忆青春'
 },
 {
 id: 2,
 name: '欧美流行金曲',
 coverImgUrl: 'https://p1.music.126.net/Gk8F2V26K1e8h8zC86R1VA==/109951164169495430.jpg',
 playCount: 9820000,
 creator: {
 nickname: '欧美音乐控',
 avatarDetail: null
 },
 tags: ['欧美', '流行', '英文'],
 updateTime: Date.now() - 86400000 * 5,
 description: '最新欧美流行金曲推荐'
 },
 {
 id: 3,
 name: '电子音乐狂欢',
 coverImgUrl: 'https://p1.music.126.net/rj7Xy0K07-9pLp3zNKR2Vw==/109951165505513293.jpg',
 playCount: 7650000,
 creator: {
 nickname: 'EDM爱好者',
 avatarDetail: null
 },
 tags: ['电子', 'EDM', '舞曲'],
 updateTime: Date.now() - 86400000 * 1,
 description: '劲爆电子音乐，点燃派对氛围'
 },
 {
 id: 4,
 name: '治愈系轻音乐',
 coverImgUrl: 'https://p1.music.126.net/3NtFzV6-8H0jN2e4Z3Q7Rg==/109951165898762458.jpg',
 playCount: 5420000,
 creator: {
 nickname: '静心音乐',
 avatarDetail: null
 },
 tags: ['轻音乐', '治愈', '纯音乐'],
 updateTime: Date.now() - 86400000 * 3,
 description: '放松心情，舒缓压力'
 },
 {
 id: 5,
 name: '摇滚精神',
 coverImgUrl: 'https://p1.music.126.net/9F6x7G4H2J8K1L9M3N0P7==/109951163987562341.jpg',
 playCount: 8910000,
 creator: {
 nickname: '摇滚不死',
 avatarDetail: null
 },
 tags: ['摇滚', '重金属', '朋克'],
 updateTime: Date.now() - 86400000 * 7,
 description: '摇滚精神永不熄灭'
 },
 {
 id: 6,
 name: '民谣在路上',
 coverImgUrl: 'https://p1.music.126.net/2P3O9K8N7M6L5J4H3G2F1==/109951164523789012.jpg',
 playCount: 6780000,
 creator: {
 nickname: '民谣歌手',
 avatarDetail: null
 },
 tags: ['民谣', '原创', '校园'],
 updateTime: Date.now() - 86400000 * 4,
 description: '用民谣讲述故事'
 },
 {
 id: 7,
 name: 'R&B节奏蓝调',
 coverImgUrl: 'https://p1.music.126.net/5K4J3H2G1F0D9S8A7S6D5==/109951165219345678.jpg',
 playCount: 8340000,
 creator: {
 nickname: '节奏达人',
 avatarDetail: null
 },
 tags: ['R&B', '灵魂', '节奏'],
 updateTime: Date.now() - 86400000 * 6,
 description: '感受R&B的独特魅力'
 },
 {
 id: 8,
 name: '古典音乐殿堂',
 coverImgUrl: 'https://p1.music.126.net/8A7S6D5F4G3H2J1K0L9M8==/109951163876234567.jpg',
 playCount: 4560000,
 creator: {
 nickname: '古典音乐迷',
 avatarDetail: null
 },
 tags: ['古典', '交响乐', '钢琴'],
 updateTime: Date.now() - 86400000 * 10,
 description: '聆听古典音乐的精髓'
 },
 {
 id: 9,
 name: '日韩流行精选',
 coverImgUrl: 'https://p1.music.126.net/1Q2W3E4R5T6Y7U8I9O0P9==/109951165678234567.jpg',
 playCount: 7230000,
 creator: {
 nickname: '日韩粉丝',
 avatarDetail: null
 },
 tags: ['韩语', '日语', '流行'],
 updateTime: Date.now() - 86400000 * 8,
 description: '日韩流行音乐精选'
 },
 {
 id: 10,
 name: '华语说唱合集',
 coverImgUrl: 'https://p1.music.126.net/4R5T6Y7U8I9O0P1A2S3D4==/109951164987234567.jpg',
 playCount: 9120000,
 creator: {
 nickname: '说唱爱好者',
 avatarDetail: null
 },
 tags: ['说唱', '嘻哈', '中文'],
 updateTime: Date.now() - 86400000 * 9,
 description: '中文说唱的力量'
 },
 {
 id: 11,
 name: '怀旧金曲8090',
 coverImgUrl: 'https://p1.music.126.net/7U8I9O0P1A2S3D4F5G6H7==/109951163765234567.jpg',
 playCount: 10230000,
 creator: {
 nickname: '怀旧经典',
 avatarDetail: null
 },
 tags: ['怀旧', '经典', '80后'],
 updateTime: Date.now() - 86400000 * 12,
 description: '8090后的青春记忆'
 },
 {
 id: 12,
 name: '电音未来',
 coverImgUrl: 'https://p1.music.126.net/0P1A2S3D4F5G6H7J8K9L0==/109951165432134567.jpg',
 playCount: 6540000,
 creator: {
 nickname: '未来电音',
 avatarDetail: null
 },
 tags: ['电子', '未来贝斯', 'Dubstep'],
 updateTime: Date.now() - 86400000 * 15,
 description: '探索电音的未来'
 },
 {
 id: 13,
 name: '爵士咖啡馆',
 coverImgUrl: 'https://p1.music.126.net/3S4D5F6G7H8J9K0L1M2N3==/109951163543234567.jpg',
 playCount: 3890000,
 creator: {
 nickname: '爵士人生',
 avatarDetail: null
 },
 tags: ['爵士', '蓝调', '咖啡馆'],
 updateTime: Date.now() - 86400000 * 18,
 description: '慵懒爵士，惬意时光'
 },
 {
 id: 14,
 name: '电影原声大碟',
 coverImgUrl: 'https://p1.music.126.net/6F7G8H9J0K1L2M3N4B5V6==/109951165210987654.jpg',
 playCount: 5210000,
 creator: {
 nickname: '电影迷',
 avatarDetail: null
 },
 tags: ['原声', '电影', '配乐'],
 updateTime: Date.now() - 86400000 * 20,
 description: '那些触动心灵的电影配乐'
 },
 {
 id: 15,
 name: '中国风音乐',
 coverImgUrl: 'https://p1.music.126.net/9J0K1L2M3N4B5V6C7X8Z9==/109951164876543210.jpg',
 playCount: 8670000,
 creator: {
 nickname: '国风少年',
 avatarDetail: null
 },
 tags: ['中国风', '古风', '古典'],
 updateTime: Date.now() - 86400000 * 22,
 description: '传承中华音乐之美'
 },
 {
 id: 16,
 name: 'Reggae雷鬼',
 coverImgUrl: 'https://p1.music.126.net/2M3N4B5V6C7X8Z9A0S1D2==/109951163456789012.jpg',
 playCount: 2980000,
 creator: {
 nickname: '雷鬼达人',
 avatarDetail: null
 },
 tags: ['雷鬼', 'Reggae', '牙买加'],
 updateTime: Date.now() - 86400000 * 25,
 description: '感受雷鬼的自由节奏'
 },
 {
 id: 17,
 name: '金属狂潮',
 coverImgUrl: 'https://p1.music.126.net/5B6V7C8X9Z0A1S2D3F4G5==/109951165678901234.jpg',
 playCount: 4120000,
 creator: {
 nickname: '金属战士',
 avatarDetail: null
 },
 tags: ['金属', '硬核', '嘶吼'],
 updateTime: Date.now() - 86400000 * 28,
 description: '金属音乐的力量'
 },
 {
 id: 18,
 name: 'Acoustic不插电',
 coverImgUrl: 'https://p1.music.126.net/8C9X0Z1A2S3D4F5G6H7J8==/109951163234567890.jpg',
 playCount: 3560000,
 creator: {
 nickname: '原声吉他',
 avatarDetail: null
 },
 tags: ['原声', '不插电', '吉他'],
 updateTime: Date.now() - 86400000 * 30,
 description: '回归音乐本真'
 },
 {
 id: 19,
 name: '世界音乐之旅',
 coverImgUrl: 'https://p1.music.126.net/1Z2A3S4D5F6G7H8J9K0L1==/109951165456789012.jpg',
 playCount: 2890000,
 creator: {
 nickname: '环球音乐',
 avatarDetail: null
 },
 tags: ['世界音乐', '民族', '跨界'],
 updateTime: Date.now() - 86400000 * 35,
 description: '聆听世界各地的声音'
 },
 {
 id: 20,
 name: 'K-Pop韩流',
 coverImgUrl: 'https://p1.music.126.net/4S5D6F7G8H9J0K1L2M3N4==/109951163012345678.jpg',
 playCount: 11230000,
 creator: {
 nickname: '韩流粉丝',
 avatarDetail: null
 },
 tags: ['韩语', 'K-Pop', '偶像'],
 updateTime: Date.now() - 86400000 * 40,
 description: '韩流来袭，不可阻挡'
 },
 {
 id: 21,
 name: '轻音乐下午茶',
 coverImgUrl: 'https://p1.music.126.net/7G8H9J0K1L2M3N4B5V6C7==/109951165890123456.jpg',
 playCount: 5670000,
 creator: {
 nickname: '休闲时光',
 avatarDetail: null
 },
 tags: ['轻音乐', '休闲', '钢琴'],
 updateTime: Date.now() - 86400000 * 45,
 description: '午后时光，静静聆听'
 },
 {
 id: 22,
 name: '电子舞曲TOP100',
 coverImgUrl: 'https://p1.music.126.net/0J1K2L3M4N5B6V7C8X9Z0==/109951162890123456.jpg',
 playCount: 13450000,
 creator: {
 nickname: 'DJ达人',
 avatarDetail: null
 },
 tags: ['电子', '舞曲', 'EDM'],
 updateTime: Date.now() - 86400000 * 50,
 description: '全球热门电子舞曲'
 },
 {
 id: 23,
 name: '华语新声代',
 coverImgUrl: 'https://p1.music.126.net/3M4N5B6V7C8X9Z0A1S2D3==/109951165678901234.jpg',
 playCount: 7890000,
 creator: {
 nickname: '新声力量',
 avatarDetail: null
 },
 tags: ['华语', '新人', '原创'],
 updateTime: Date.now() - 86400000 * 55,
 description: '华语乐坛新声音'
 },
 {
 id: 24,
 name: '拉丁风情',
 coverImgUrl: 'https://p1.music.126.net/6B7V8C9X0Z1A2S3D4F5G6==/109951162678901234.jpg',
 playCount: 3450000,
 creator: {
 nickname: '拉丁舞者',
 avatarDetail: null
 },
 tags: ['拉丁', '桑巴', '热情'],
 updateTime: Date.now() - 86400000 * 60,
 description: '感受拉丁的热情'
 },
 {
 id: 25,
 name: '独立音乐合集',
 coverImgUrl: 'https://p1.music.126.net/9X0Z1A2S3D4F5G6H7J8K9==/109951165456789012.jpg',
 playCount: 4560000,
 creator: {
 nickname: '独立之声',
 avatarDetail: null
 },
 tags: ['独立', '小众', '原创'],
 updateTime: Date.now() - 86400000 * 65,
 description: '独立音乐的魅力'
 },
 {
 id: 26,
 name: '儿童音乐启蒙',
 coverImgUrl: 'https://p1.music.126.net/2Z3A4S5D6F7G8H9J0K1L2==/109951162456789012.jpg',
 playCount: 2120000,
 creator: {
 nickname: '儿歌天地',
 avatarDetail: null
 },
 tags: ['儿童', '启蒙', '儿歌'],
 updateTime: Date.now() - 86400000 * 70,
 description: '陪伴孩子成长的音乐'
 },
 {
 id: 27,
 name: '朋克精神',
 coverImgUrl: 'https://p1.music.126.net/5S6D7F8G9H0J1K2L3M4N5==/109951165234567890.jpg',
 playCount: 3780000,
 creator: {
 nickname: '朋克青年',
 avatarDetail: null
 },
 tags: ['朋克', '摇滚', '反叛'],
 updateTime: Date.now() - 86400000 * 75,
 description: '朋克不死，精神永存'
 },
 {
 id: 28,
 name: '民谣诗人',
 coverImgUrl: 'https://p1.music.126.net/8D9F0G1H2J3K4L5M6N7B8==/109951162234567890.jpg',
 playCount: 6340000,
 creator: {
 nickname: '民谣诗人',
 avatarDetail: null
 },
 tags: ['民谣', '诗意', '故事'],
 updateTime: Date.now() - 86400000 * 80,
 description: '用民谣写诗'
 },
 {
 id: 29,
 name: '新世纪音乐',
 coverImgUrl: 'https://p1.music.126.net/1G2H3J4K5L6M7N8B9V0C1==/109951165012345678.jpg',
 playCount: 2980000,
 creator: {
 nickname: '新世纪之声',
 avatarDetail: null
 },
 tags: ['新世纪', '冥想', '治愈'],
 updateTime: Date.now() - 86400000 * 85,
 description: '开启心灵之旅'
 },
 {
 id: 30,
 name: '抖音热门歌单',
 coverImgUrl: 'https://p1.music.126.net/4K5L6M7N8B9V0C1X2Z3A4==/109951162012345678.jpg',
 playCount: 15670000,
 creator: {
 nickname: '抖音热歌',
 avatarDetail: null
 },
 tags: ['抖音', '热门', '流行'],
 updateTime: Date.now() - 86400000 * 90,
 description: '抖音上最火的歌曲'
 }
]
export function getMockPlaylists() {
 return mockPlaylists
}
export function getCollectedPlaylists() {
 try {
 const collected = localStorage.getItem(COLLECTED_PLAYLISTS_KEY)
 return collected ? JSON.parse(collected) : []
 }
 catch (e) {
 console.error('获取收藏歌单失败:', e)
 return []
 }
}
export function saveCollectedPlaylists(playlists) {
 try {
 localStorage.setItem(COLLECTED_PLAYLISTS_KEY, JSON.stringify(playlists))
 }
 catch (e) {
 console.error('保存收藏歌单失败:', e)
 }
}
export function isPlaylistCollected(playlistId) {
 const collected = getCollectedPlaylists()
 return collected.some(p => p.id === playlistId)
}
export function getRecommendedPlaylists(genre = null) {
 let playlists = [...mockPlaylists]
 if (genre) {
 playlists = playlists.filter(p => p.tags && p.tags.includes(genre))
 }
 return playlists.sort((a, b) => b.playCount - a.playCount)
}
export function getLatestPlaylists(limit = 20) {
 return [...mockPlaylists]
 .sort((a, b) => b.updateTime - a.updateTime)
 .slice(0, limit)
}
export function getPopularPlaylists(limit = 20) {
 return [...mockPlaylists]
 .sort((a, b) => b.playCount - a.playCount)
 .slice(0, limit)
}

const mockPlaylistDetails = {
 1: {
 id: 1,
 name: '周杰伦经典合集',
 coverImgUrl: 'https://p1.music.126.net/oeH9rlBAj3UNkhOmfog8Hw==/18686561631358570.jpg',
 coverImgId: 18686561631358570,
 userId: 1001,
 nickName: '音乐达人',
 playCount: 12580000,
 trackCount: 50,
 trackUpdateTime: Date.now() - 86400000 * 2,
 description: '周杰伦经典歌曲合集，回忆青春，包含《晴天》《七里香》《青花瓷》等经典之作',
 tags: ['华语', '流行', '经典'],
 subscribedCount: 258000,
 shareCount: 125000,
 commentCount: 89000,
 createTime: Date.now() - 86400000 * 365,
 updateTime: Date.now() - 86400000 * 2,
 trackIds: [
 { id: 1001, v: 1 },
 { id: 1002, v: 1 },
 { id: 1003, v: 1 },
 { id: 1004, v: 1 },
 { id: 1005, v: 1 },
 { id: 1006, v: 1 },
 { id: 1007, v: 1 },
 { id: 1008, v: 1 },
 { id: 1009, v: 1 },
 { id: 1010, v: 1 }
 ]
 },
 2: {
 id: 2,
 name: '欧美流行金曲',
 coverImgUrl: 'https://p1.music.126.net/Gk8F2V26K1e8h8zC86R1VA==/109951164169495430.jpg',
 coverImgId: 109951164169495430,
 userId: 1002,
 nickName: '欧美音乐控',
 playCount: 9820000,
 trackCount: 45,
 trackUpdateTime: Date.now() - 86400000 * 5,
 description: '最新欧美流行金曲推荐，包含Billboard热门单曲',
 tags: ['欧美', '流行', '英文'],
 subscribedCount: 198000,
 shareCount: 98000,
 commentCount: 76000,
 createTime: Date.now() - 86400000 * 200,
 updateTime: Date.now() - 86400000 * 5,
 trackIds: [
 { id: 2001, v: 1 },
 { id: 2002, v: 1 },
 { id: 2003, v: 1 },
 { id: 2004, v: 1 },
 { id: 2005, v: 1 },
 { id: 2006, v: 1 },
 { id: 2007, v: 1 },
 { id: 2008, v: 1 },
 { id: 2009, v: 1 },
 { id: 2010, v: 1 }
 ]
 },
 3: {
 id: 3,
 name: '电子音乐狂欢',
 coverImgUrl: 'https://p1.music.126.net/rj7Xy0K07-9pLp3zNKR2Vw==/109951165505513293.jpg',
 coverImgId: 109951165505513293,
 userId: 1003,
 nickName: 'EDM爱好者',
 playCount: 7650000,
 trackCount: 60,
 trackUpdateTime: Date.now() - 86400000 * 1,
 description: '劲爆电子音乐，点燃派对氛围，包含最新EDM单曲',
 tags: ['电子', 'EDM', '舞曲'],
 subscribedCount: 156000,
 shareCount: 78000,
 commentCount: 56000,
 createTime: Date.now() - 86400000 * 150,
 updateTime: Date.now() - 86400000 * 1,
 trackIds: [
 { id: 3001, v: 1 },
 { id: 3002, v: 1 },
 { id: 3003, v: 1 },
 { id: 3004, v: 1 },
 { id: 3005, v: 1 },
 { id: 3006, v: 1 },
 { id: 3007, v: 1 },
 { id: 3008, v: 1 },
 { id: 3009, v: 1 },
 { id: 3010, v: 1 }
 ]
 },
 4: {
 id: 4,
 name: '治愈系轻音乐',
 coverImgUrl: 'https://p1.music.126.net/3NtFzV6-8H0jN2e4Z3Q7Rg==/109951165898762458.jpg',
 coverImgId: 109951165898762458,
 userId: 1004,
 nickName: '静心音乐',
 playCount: 5420000,
 trackCount: 35,
 trackUpdateTime: Date.now() - 86400000 * 3,
 description: '放松心情，舒缓压力，适合工作学习时聆听的轻音乐',
 tags: ['轻音乐', '治愈', '纯音乐'],
 subscribedCount: 123000,
 shareCount: 56000,
 commentCount: 45000,
 createTime: Date.now() - 86400000 * 280,
 updateTime: Date.now() - 86400000 * 3,
 trackIds: [
 { id: 4001, v: 1 },
 { id: 4002, v: 1 },
 { id: 4003, v: 1 },
 { id: 4004, v: 1 },
 { id: 4005, v: 1 },
 { id: 4006, v: 1 },
 { id: 4007, v: 1 },
 { id: 4008, v: 1 },
 { id: 4009, v: 1 },
 { id: 4010, v: 1 }
 ]
 },
 5: {
 id: 5,
 name: '摇滚精神',
 coverImgUrl: 'https://p1.music.126.net/9F6x7G4H2J8K1L9M3N0P7==/109951163987562341.jpg',
 coverImgId: 109951163987562341,
 userId: 1005,
 nickName: '摇滚不死',
 playCount: 8910000,
 trackCount: 48,
 trackUpdateTime: Date.now() - 86400000 * 7,
 description: '摇滚精神永不熄灭，经典摇滚乐队合集',
 tags: ['摇滚', '重金属', '朋克'],
 subscribedCount: 178000,
 shareCount: 89000,
 commentCount: 67000,
 createTime: Date.now() - 86400000 * 400,
 updateTime: Date.now() - 86400000 * 7,
 trackIds: [
 { id: 5001, v: 1 },
 { id: 5002, v: 1 },
 { id: 5003, v: 1 },
 { id: 5004, v: 1 },
 { id: 5005, v: 1 },
 { id: 5006, v: 1 },
 { id: 5007, v: 1 },
 { id: 5008, v: 1 },
 { id: 5009, v: 1 },
 { id: 5010, v: 1 }
 ]
 },
 6: {
 id: 6,
 name: '民谣在路上',
 coverImgUrl: 'https://p1.music.126.net/2P3O9K8N7M6L5J4H3G2F1==/109951164523789012.jpg',
 coverImgId: 109951164523789012,
 userId: 1006,
 nickName: '民谣歌手',
 playCount: 6780000,
 trackCount: 42,
 trackUpdateTime: Date.now() - 86400000 * 4,
 description: '用民谣讲述故事，包含赵雷、宋冬野、陈粒等民谣歌手代表作',
 tags: ['民谣', '原创', '校园'],
 subscribedCount: 145000,
 shareCount: 67000,
 commentCount: 52000,
 createTime: Date.now() - 86400000 * 220,
 updateTime: Date.now() - 86400000 * 4,
 trackIds: [
 { id: 6001, v: 1 },
 { id: 6002, v: 1 },
 { id: 6003, v: 1 },
 { id: 6004, v: 1 },
 { id: 6005, v: 1 },
 { id: 6006, v: 1 },
 { id: 6007, v: 1 },
 { id: 6008, v: 1 },
 { id: 6009, v: 1 },
 { id: 6010, v: 1 }
 ]
 }
}

const mockSongs = {
 1001: { id: 1001, name: '晴天', ar: [{ id: 1, name: '周杰伦' }], al: { id: 100, name: '叶惠美', picUrl: 'https://p1.music.126.net/xxx' }, dt: 269000 },
 1002: { id: 1002, name: '七里香', ar: [{ id: 1, name: '周杰伦' }], al: { id: 101, name: '七里香', picUrl: 'https://p1.music.126.net/xxx' }, dt: 299000 },
 1003: { id: 1003, name: '青花瓷', ar: [{ id: 1, name: '周杰伦' }], al: { id: 102, name: '我很忙', picUrl: 'https://p1.music.126.net/xxx' }, dt: 239000 },
 1004: { id: 1004, name: '稻香', ar: [{ id: 1, name: '周杰伦' }], al: { id: 103, name: '魔杰座', picUrl: 'https://p1.music.126.net/xxx' }, dt: 223000 },
 1005: { id: 1005, name: '夜曲', ar: [{ id: 1, name: '周杰伦' }], al: { id: 104, name: '十一月的肖邦', picUrl: 'https://p1.music.126.net/xxx' }, dt: 226000 },
 1006: { id: 1006, name: '以父之名', ar: [{ id: 1, name: '周杰伦' }], al: { id: 105, name: '叶惠美', picUrl: 'https://p1.music.126.net/xxx' }, dt: 392000 },
 1007: { id: 1007, name: '双截棍', ar: [{ id: 1, name: '周杰伦' }], al: { id: 106, name: '范特西', picUrl: 'https://p1.music.126.net/xxx' }, dt: 220000 },
 1008: { id: 1008, name: '简单爱', ar: [{ id: 1, name: '周杰伦' }], al: { id: 107, name: '范特西', picUrl: 'https://p1.music.126.net/xxx' }, dt: 232000 },
 1009: { id: 1009, name: '龙卷风', ar: [{ id: 1, name: '周杰伦' }], al: { id: 108, name: 'Jay', picUrl: 'https://p1.music.126.net/xxx' }, dt: 249000 },
 1010: { id: 1010, name: '一路向北', ar: [{ id: 1, name: '周杰伦' }], al: { id: 109, name: 'J III MP3 Player', picUrl: 'https://p1.music.126.net/xxx' }, dt: 267000 },
 2001: { id: 2001, name: 'Blinding Lights', ar: [{ id: 2, name: 'The Weeknd' }], al: { id: 200, name: 'After Hours', picUrl: 'https://p1.music.126.net/xxx' }, dt: 200000 },
 2002: { id: 2002, name: 'Levitating', ar: [{ id: 3, name: 'Dua Lipa' }], al: { id: 201, name: 'Future Nostalgia', picUrl: 'https://p1.music.126.net/xxx' }, dt: 223000 },
 2003: { id: 2003, name: 'Save Your Tears', ar: [{ id: 2, name: 'The Weeknd' }], al: { id: 202, name: 'After Hours', picUrl: 'https://p1.music.126.net/xxx' }, dt: 215000 },
 2004: { id: 2004, name: 'Good 4 U', ar: [{ id: 4, name: 'Olivia Rodrigo' }], al: { id: 203, name: 'SOUR', picUrl: 'https://p1.music.126.net/xxx' }, dt: 178000 },
 2005: { id: 2005, name: 'Montero', ar: [{ id: 5, name: 'Lil Nas X' }], al: { id: 204, name: 'MONTERO', picUrl: 'https://p1.music.126.net/xxx' }, dt: 177000 },
 2006: { id: 2006, name: 'Peaches', ar: [{ id: 6, name: 'Justin Bieber' }], al: { id: 205, name: 'Justice', picUrl: 'https://p1.music.126.net/xxx' }, dt: 198000 },
 2007: { id: 2007, name: 'Drivers License', ar: [{ id: 4, name: 'Olivia Rodrigo' }], al: { id: 206, name: 'SOUR', picUrl: 'https://p1.music.126.net/xxx' }, dt: 242000 },
 2008: { id: 2008, name: 'Mood', ar: [{ id: 7, name: '24kGoldn' }], al: { id: 207, name: 'El Dorado', picUrl: 'https://p1.music.126.net/xxx' }, dt: 142000 },
 2009: { id: 2009, name: 'Positions', ar: [{ id: 8, name: 'Ariana Grande' }], al: { id: 208, name: 'Positions', picUrl: 'https://p1.music.126.net/xxx' }, dt: 173000 },
 2010: { id: 2010, name: 'Watermelon Sugar', ar: [{ id: 9, name: 'Harry Styles' }], al: { id: 209, name: 'Fine Line', picUrl: 'https://p1.music.126.net/xxx' }, dt: 174000 },
 3001: { id: 3001, name: 'Faded', ar: [{ id: 10, name: 'Alan Walker' }], al: { id: 300, name: 'Faded', picUrl: 'https://p1.music.126.net/xxx' }, dt: 234000 },
 3002: { id: 3002, name: 'Alone', ar: [{ id: 10, name: 'Alan Walker' }], al: { id: 301, name: 'Alone', picUrl: 'https://p1.music.126.net/xxx' }, dt: 233000 },
 3003: { id: 3003, name: 'The Spectre', ar: [{ id: 10, name: 'Alan Walker' }], al: { id: 302, name: 'The Spectre', picUrl: 'https://p1.music.126.net/xxx' }, dt: 212000 },
 3004: { id: 3004, name: 'Wolves', ar: [{ id: 11, name: 'Selena Gomez' }], al: { id: 303, name: 'Wolves', picUrl: 'https://p1.music.126.net/xxx' }, dt: 231000 },
 3005: { id: 3005, name: 'Closer', ar: [{ id: 12, name: 'The Chainsmokers' }], al: { id: 304, name: 'Collage', picUrl: 'https://p1.music.126.net/xxx' }, dt: 244000 },
 3006: { id: 3006, name: 'Something Just Like This', ar: [{ id: 12, name: 'The Chainsmokers' }], al: { id: 305, name: 'Memories...Do Not Open', picUrl: 'https://p1.music.126.net/xxx' }, dt: 237000 },
 3007: { id: 3007, name: 'Faded (Instrumental)', ar: [{ id: 10, name: 'Alan Walker' }], al: { id: 306, name: 'Faded', picUrl: 'https://p1.music.126.net/xxx' }, dt: 234000 },
 3008: { id: 3008, name: 'On My Way', ar: [{ id: 13, name: 'Alan Walker' }], al: { id: 307, name: 'On My Way', picUrl: 'https://p1.music.126.net/xxx' }, dt: 214000 },
 3009: { id: 3009, name: 'Darkside', ar: [{ id: 10, name: 'Alan Walker' }], al: { id: 308, name: 'Different World', picUrl: 'https://p1.music.126.net/xxx' }, dt: 233000 },
 3010: { id: 3010, name: 'Ignite', ar: [{ id: 10, name: 'Alan Walker' }], al: { id: 309, name: 'Ignite', picUrl: 'https://p1.music.126.net/xxx' }, dt: 212000 },
 4001: { id: 4001, name: 'Kiss the Rain', ar: [{ id: 14, name: 'Yiruma' }], al: { id: 400, name: 'From the Yellow Room', picUrl: 'https://p1.music.126.net/xxx' }, dt: 270000 },
 4002: { id: 4002, name: 'River Flows in You', ar: [{ id: 14, name: 'Yiruma' }], al: { id: 401, name: 'First Love', picUrl: 'https://p1.music.126.net/xxx' }, dt: 254000 },
 4003: { id: 4003, name: 'Canon in D', ar: [{ id: 15, name: 'Johann Pachelbel' }], al: { id: 402, name: 'Canon in D Major', picUrl: 'https://p1.music.126.net/xxx' }, dt: 300000 },
 4004: { id: 4004, name: 'Clair de Lune', ar: [{ id: 16, name: 'Debussy' }], al: { id: 403, name: 'Suite Bergamasque', picUrl: 'https://p1.music.126.net/xxx' }, dt: 322000 },
 4005: { id: 4005, name: 'Nocturne No.2 in E flat', ar: [{ id: 17, name: 'Chopin' }], al: { id: 404, name: 'Nocturnes, Op.9', picUrl: 'https://p1.music.126.net/xxx' }, dt: 300000 },
 4006: { id: 4006, name: 'Turkish March', ar: [{ id: 18, name: 'Mozart' }], al: { id: 405, name: 'Piano Sonata No.11', picUrl: 'https://p1.music.126.net/xxx' }, dt: 212000 },
 4007: { id: 4007, name: 'Moonlight Sonata', ar: [{ id: 19, name: 'Beethoven' }], al: { id: 406, name: 'Piano Sonata No.14', picUrl: 'https://p1.music.126.net/xxx' }, dt: 348000 },
 4008: { id: 4008, name: 'Für Elise', ar: [{ id: 19, name: 'Beethoven' }], al: { id: 407, name: 'Bagatelle No.25', picUrl: 'https://p1.music.126.net/xxx' }, dt: 142000 },
 4009: { id: 4009, name: 'A Thousand Miles', ar: [{ id: 20, name: 'Vanessa Carlton' }], al: { id: 408, name: 'Be Not Nobody', picUrl: 'https://p1.music.126.net/xxx' }, dt: 282000 },
 4010: { id: 4010, name: 'Lemon', ar: [{ id: 21, name: 'Kenshi Yonezu' }], al: { id: 409, name: 'Lemon', picUrl: 'https://p1.music.126.net/xxx' }, dt: 324000 },
 5001: { id: 5001, name: 'Bohemian Rhapsody', ar: [{ id: 22, name: 'Queen' }], al: { id: 500, name: 'A Night at the Opera', picUrl: 'https://p1.music.126.net/xxx' }, dt: 354000 },
 5002: { id: 5002, name: 'Stairway to Heaven', ar: [{ id: 23, name: 'Led Zeppelin' }], al: { id: 501, name: 'Led Zeppelin IV', picUrl: 'https://p1.music.126.net/xxx' }, dt: 482000 },
 5003: { id: 5003, name: 'Sweet Child O Mine', ar: [{ id: 24, name: 'Guns N Roses' }], al: { id: 502, name: 'Appetite for Destruction', picUrl: 'https://p1.music.126.net/xxx' }, dt: 356000 },
 5004: { id: 5004, name: 'Smells Like Teen Spirit', ar: [{ id: 25, name: 'Nirvana' }], al: { id: 503, name: 'Nevermind', picUrl: 'https://p1.music.126.net/xxx' }, dt: 301000 },
 5005: { id: 5005, name: 'Enter Sandman', ar: [{ id: 26, name: 'Metallica' }], al: { id: 504, name: 'Metallica', picUrl: 'https://p1.music.126.net/xxx' }, dt: 331000 },
 5006: { id: 5006, name: 'Hotel California', ar: [{ id: 27, name: 'Eagles' }], al: { id: 505, name: 'Hotel California', picUrl: 'https://p1.music.126.net/xxx' }, dt: 391000 },
 5007: { id: 5007, name: 'Free Bird', ar: [{ id: 28, name: 'Lynyrd Skynyrd' }], al: { id: 506, name: 'Pronounced Leh-Nerd Skin-Nerd', picUrl: 'https://p1.music.126.net/xxx' }, dt: 305000 },
 5008: { id: 5008, name: 'Paradise City', ar: [{ id: 24, name: 'Guns N Roses' }], al: { id: 507, name: 'Appetite for Destruction', picUrl: 'https://p1.music.126.net/xxx' }, dt: 342000 },
 5009: { id: 5009, name: 'Welcome to the Jungle', ar: [{ id: 24, name: 'Guns N Roses' }], al: { id: 508, name: 'Appetite for Destruction', picUrl: 'https://p1.music.126.net/xxx' }, dt: 272000 },
 5010: { id: 5010, name: 'Don\'t Stop Believin\'', ar: [{ id: 29, name: 'Journey' }], al: { id: 509, name: 'Escape', picUrl: 'https://p1.music.126.net/xxx' }, dt: 293000 },
 6001: { id: 6001, name: '成都', ar: [{ id: 30, name: '赵雷' }], al: { id: 600, name: '无法长大', picUrl: 'https://p1.music.126.net/xxx' }, dt: 294000 },
 6002: { id: 6002, name: '理想', ar: [{ id: 30, name: '赵雷' }], al: { id: 601, name: '吉姆餐厅', picUrl: 'https://p1.music.126.net/xxx' }, dt: 350000 },
 6003: { id: 6003, name: '南方姑娘', ar: [{ id: 30, name: '赵雷' }], al: { id: 602, name: '赵小雷', picUrl: 'https://p1.music.126.net/xxx' }, dt: 307000 },
 6004: { id: 6004, name: '安和桥', ar: [{ id: 31, name: '宋冬野' }], al: { id: 603, name: '安和桥北', picUrl: 'https://p1.music.126.net/xxx' }, dt: 306000 },
 6005: { id: 6005, name: '董小姐', ar: [{ id: 31, name: '宋冬野' }], al: { id: 604, name: '安和桥北', picUrl: 'https://p1.music.126.net/xxx' }, dt: 294000 },
 6006: { id: 6006, name: '奇妙能力歌', ar: [{ id: 32, name: '陈粒' }], al: { id: 605, name: '如也', picUrl: 'https://p1.music.126.net/xxx' }, dt: 255000 },
 6007: { id: 6007, name: '走马', ar: [{ id: 32, name: '陈粒' }], al: { id: 606, name: '如也', picUrl: 'https://p1.music.126.net/xxx' }, dt: 333000 },
 6008: { id: 6008, name: '奇妙能力歌 (Live)', ar: [{ id: 32, name: '陈粒' }], al: { id: 607, name: '如也', picUrl: 'https://p1.music.126.net/xxx' }, dt: 263000 },
 6009: { id: 6009, name: '我记得', ar: [{ id: 33, name: '赵雷' }], al: { id: 608, name: '署前街少年', picUrl: 'https://p1.music.126.net/xxx' }, dt: 368000 },
 6010: { id: 6010, name: '同桌的你', ar: [{ id: 34, name: '老狼' }], al: { id: 609, name: '恋恋风尘', picUrl: 'https://p1.music.126.net/xxx' }, dt: 248000 }
}

const mockComments = {
 1: [
 { user: { nickname: '音乐爱好者1', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '经典！百听不厌', likedCount: 1256, time: Date.now() - 86400000 },
 { user: { nickname: '周杰伦粉丝', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '周杰伦的歌陪伴了我的青春', likedCount: 892, time: Date.now() - 86400000 * 2 },
 { user: { nickname: '怀旧达人', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '每一首都是回忆', likedCount: 678, time: Date.now() - 86400000 * 3 },
 { user: { nickname: '音乐评论家', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '周杰伦的音乐才华无可挑剔', likedCount: 543, time: Date.now() - 86400000 * 4 },
 { user: { nickname: '路人甲', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '好听', likedCount: 321, time: Date.now() - 86400000 * 5 }
 ],
 2: [
 { user: { nickname: '欧美控', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '欧美流行yyds', likedCount: 987, time: Date.now() - 86400000 },
 { user: { nickname: 'Billboard粉丝', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '每天都在听这个歌单', likedCount: 765, time: Date.now() - 86400000 * 2 },
 { user: { nickname: '英文歌爱好者', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '选曲很棒', likedCount: 543, time: Date.now() - 86400000 * 3 }
 ],
 3: [
 { user: { nickname: 'EDM狂人', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '太嗨了！', likedCount: 1234, time: Date.now() - 86400000 },
 { user: { nickname: '电音爱好者', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '开车必听', likedCount: 876, time: Date.now() - 86400000 * 2 },
 { user: { nickname: '派对达人', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '派对必备歌单', likedCount: 654, time: Date.now() - 86400000 * 3 }
 ],
 4: [
 { user: { nickname: '轻音乐迷', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '工作时听很放松', likedCount: 789, time: Date.now() - 86400000 },
 { user: { nickname: '钢琴爱好者', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '钢琴曲太治愈了', likedCount: 567, time: Date.now() - 86400000 * 2 },
 { user: { nickname: '午休必备', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '午休时听很快入睡', likedCount: 345, time: Date.now() - 86400000 * 3 }
 ],
 5: [
 { user: { nickname: '摇滚青年', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '摇滚不死！', likedCount: 1456, time: Date.now() - 86400000 },
 { user: { nickname: '金属党', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '太带劲了！', likedCount: 987, time: Date.now() - 86400000 * 2 },
 { user: { nickname: '吉他手', avatarUrl: 'https://p1.music.126.net/xxx' }, content: 'solo太精彩了', likedCount: 654, time: Date.now() - 86400000 * 3 }
 ],
 6: [
 { user: { nickname: '民谣歌手', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '民谣最有故事', likedCount: 876, time: Date.now() - 86400000 },
 { user: { nickname: '赵雷粉丝', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '成都百听不厌', likedCount: 654, time: Date.now() - 86400000 * 2 },
 { user: { nickname: '校园民谣', avatarUrl: 'https://p1.music.126.net/xxx' }, content: '回到了大学时代', likedCount: 432, time: Date.now() - 86400000 * 3 }
 ]
}

export function getPlaylistDetail(playlistId) {
 const detail = mockPlaylistDetails[parseInt(playlistId)]
 if (detail) {
 return { playlist: detail }
 }
 return { playlist: mockPlaylistDetails[1] }
}

export function getSongDetails(ids) {
 const idList = ids.split(',')
 const songs = idList.map(id => mockSongs[parseInt(id)]).filter(Boolean)
 return { songs: songs }
}

export function getPlaylistComments(playlistId, limit = 20, offset = 0) {
 const comments = mockComments[parseInt(playlistId)] || mockComments[1]
 return {
 comments: comments.slice(offset, offset + limit),
 total: comments.length,
 hotComments: comments.slice(0, 5)
 }
}
