const PLAYLIST_HISTORY_KEY = 'playlist_browse_history'
const PLAY_HISTORY_KEY = 'play_history'
const FAVORITE_PLAYLISTS_KEY = 'favorite_playlists'

export function savePlaylistHistory(playlistId) {
    let history = getPlaylistHistory()
    const index = history.indexOf(playlistId)
    if (index !== -1) {
        history.splice(index, 1)
    }
    history.unshift(playlistId)
    if (history.length > 50) {
        history = history.slice(0, 50)
    }
    localStorage.setItem(PLAYLIST_HISTORY_KEY, JSON.stringify(history))
}

export function getPlaylistHistory() {
    const history = localStorage.getItem(PLAYLIST_HISTORY_KEY)
    return history ? JSON.parse(history) : []
}

export function savePlayHistory(song) {
    let history = getPlayHistory()
    const index = history.findIndex(item => item.id === song.id)
    if (index !== -1) {
        history.splice(index, 1)
    }
    history.unshift(song)
    if (history.length > 100) {
        history = history.slice(0, 100)
    }
    localStorage.setItem(PLAY_HISTORY_KEY, JSON.stringify(history))
}

export function getPlayHistory() {
    const history = localStorage.getItem(PLAY_HISTORY_KEY)
    return history ? JSON.parse(history) : []
}

export function getFavoritePlaylists() {
    const favorites = localStorage.getItem(FAVORITE_PLAYLISTS_KEY)
    return favorites ? JSON.parse(favorites) : []
}

export function addFavoritePlaylist(playlist) {
    const favorites = getFavoritePlaylists()
    const exists = favorites.find(item => item.id === playlist.id)
    if (!exists) {
        favorites.unshift(playlist)
        localStorage.setItem(FAVORITE_PLAYLISTS_KEY, JSON.stringify(favorites))
    }
    return favorites
}

export function removeFavoritePlaylist(playlistId) {
    let favorites = getFavoritePlaylists()
    favorites = favorites.filter(item => item.id !== playlistId)
    localStorage.setItem(FAVORITE_PLAYLISTS_KEY, JSON.stringify(favorites))
    return favorites
}

export function isFavoritePlaylist(playlistId) {
    const favorites = getFavoritePlaylists()
    return favorites.some(item => item.id === playlistId)
}
