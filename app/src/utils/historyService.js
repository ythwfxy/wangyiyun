const BROWSE_HISTORY_KEY = 'music_browse_history'
const PLAY_HISTORY_KEY = 'music_play_history'
const MAX_HISTORY_LENGTH = 50

export function getBrowseHistory() {
    try {
        const history = localStorage.getItem(BROWSE_HISTORY_KEY)
        return history ? JSON.parse(history) : []
    } catch (e) {
        console.error('获取浏览历史失败:', e)
        return []
    }
}

export function getPlayHistory() {
    try {
        const history = localStorage.getItem(PLAY_HISTORY_KEY)
        return history ? JSON.parse(history) : []
    } catch (e) {
        console.error('获取播放历史失败:', e)
        return []
    }
}

export function addToBrowseHistory(item) {
    try {
        const history = getBrowseHistory()
        const existingIndex = history.findIndex(h => h.id === item.id && h.type === item.type)
        
        if (existingIndex > -1) {
            history.splice(existingIndex, 1)
        }
        
        history.unshift(item)
        
        if (history.length > MAX_HISTORY_LENGTH) {
            history.splice(MAX_HISTORY_LENGTH)
        }
        
        localStorage.setItem(BROWSE_HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
        console.error('添加浏览历史失败:', e)
    }
}

export function addToPlayHistory(item) {
    try {
        const history = getPlayHistory()
        const existingIndex = history.findIndex(h => h.id === item.id && h.type === item.type)
        
        if (existingIndex > -1) {
            history.splice(existingIndex, 1)
        }
        
        history.unshift(item)
        
        if (history.length > MAX_HISTORY_LENGTH) {
            history.splice(MAX_HISTORY_LENGTH)
        }
        
        localStorage.setItem(PLAY_HISTORY_KEY, JSON.stringify(history))
    } catch (e) {
        console.error('添加播放历史失败:', e)
    }
}

export function clearBrowseHistory() {
    try {
        localStorage.removeItem(BROWSE_HISTORY_KEY)
    } catch (e) {
        console.error('清空浏览历史失败:', e)
    }
}

export function clearPlayHistory() {
    try {
        localStorage.removeItem(PLAY_HISTORY_KEY)
    } catch (e) {
        console.error('清空播放历史失败:', e)
    }
}

export function getFavoriteGenres() {
    const browseHistory = getBrowseHistory()
    const playHistory = getPlayHistory()
    const allHistory = [...browseHistory, ...playHistory]
    
    const genreCount = {}
    allHistory.forEach(item => {
        if (item.genres && Array.isArray(item.genres)) {
            item.genres.forEach(genre => {
                genreCount[genre] = (genreCount[genre] || 0) + 1
            })
        }
    })
    
    return Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .map(([genre]) => genre)
}
