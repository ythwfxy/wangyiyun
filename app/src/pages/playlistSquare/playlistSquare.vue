<template>
    <div class="playlist-square">
        <div class="header">
            <h1>歌单广场</h1>
            <p>根据您的浏览和播放历史为您推荐</p>
        </div>

        <div class="tabs">
            <el-radio-group v-model="activeTab" size="medium">
                <el-radio-button label="similar">相似曲风</el-radio-button>
                <el-radio-button label="popular">热门程度</el-radio-button>
                <el-radio-button label="latest">最新更新</el-radio-button>
            </el-radio-group>
        </div>

        <div class="filter-bar">
            <div class="filter-row">
                <el-button 
                    type="primary" 
                    :plain="true" 
                    @click="showCollected = !showCollected"
                    :class="{ active: showCollected }"
                >
                    {{ showCollected ? '查看全部' : '查看收藏' }}
                </el-button>
            </div>
            <div class="filter-row genre-filter">
                <span>曲风筛选：</span>
                <el-tag 
                    v-for="genre in availableGenres" 
                    :key="genre" 
                    :effect="selectedGenre === genre ? 'dark' : 'plain'"
                    @click="selectedGenre = selectedGenre === genre ? '' : genre"
                    style="margin-left: 8px; margin-top: 4px; cursor: pointer;"
                >
                    {{ genre }}
                </el-tag>
            </div>
        </div>

        <div class="playlist-list">
            <div 
                v-for="playlist in currentPlaylists" 
                :key="playlist.id"
                class="playlist-card"
                @click="toPlaylistDetail(playlist.id)"
            >
                <div class="cover-wrapper">
                    <el-image 
                        :src="playlist.coverImgUrl" 
                        fit="cover"
                        class="cover"
                    ></el-image>
                    <div class="play-count">
                        <i class="el-icon-headset"></i>
                        {{ formatPlayCount(playlist.playCount) }}
                    </div>
                    <div class="favorite-btn" @click.stop="toggleFavorite(playlist)">
                        <i :class="isFavorite(playlist.id) ? 'el-icon-star-on' : 'el-icon-star-off'" :style="{ color: isFavorite(playlist.id) ? '#ffc900' : '#fff' }"></i>
                    </div>
                    <div class="play-overlay">
                        <img src="@/assets/imgs/play_1.svg" alt="play" class="play-icon" />
                    </div>
                </div>
                <div class="info">
                    <h3 class="name">{{ playlist.name }}</h3>
                    <p class="creator">
                        <i class="el-icon-user"></i>
                        {{ playlist.creator.nickname }}
                    </p>
                    <div class="tags">
                        <el-tag 
                            v-for="tag in playlist.tags.slice(0, 3)" 
                            :key="tag" 
                            size="small" 
                            effect="plain"
                        >
                            {{ tag }}
                        </el-tag>
                    </div>
                    <p class="update-time">更新于 {{ formatDate(playlist.updateTime) }}</p>
                </div>
            </div>
        </div>

        <div class="pagination-wrapper">
            <el-pagination
                background
                layout="prev, pager, next"
                :total="totalCount"
                :page-size="pageSize"
                v-model="currentPage"
            ></el-pagination>
        </div>

        <div v-if="currentPlaylists.length === 0" class="empty-state">
            <i class="el-icon-folder-opened"></i>
            <p>{{ showCollected ? '暂无收藏的歌单' : '暂无推荐歌单' }}</p>
        </div>
    </div>
</template>

<script>
import { getMockPlaylists, getCollectedPlaylists, saveCollectedPlaylists } from '@/utils/playlistService'
import { getBrowseHistory, getPlayHistory, addToBrowseHistory } from '@/utils/historyService'

export default {
    name: 'playlistSquare',
    data() {
        return {
            activeTab: 'similar',
            showCollected: false,
            selectedGenre: '',
            currentPage: 1,
            pageSize: 20,
            allPlaylists: [],
            collectedPlaylists: [],
            availableGenres: []
        }
    },
    computed: {
        currentPlaylists() {
            let playlists = this.showCollected ? this.collectedPlaylists : this.filteredPlaylists;
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return playlists.slice(start, end);
        },
        filteredPlaylists() {
            let playlists = [...this.allPlaylists];
            
            if (this.selectedGenre) {
                playlists = playlists.filter(p => p.tags && p.tags.includes(this.selectedGenre));
            }
            
            if (this.activeTab === 'similar') {
                playlists = this.sortBySimilarity(playlists);
            } else if (this.activeTab === 'popular') {
                playlists.sort((a, b) => b.playCount - a.playCount);
            } else if (this.activeTab === 'latest') {
                playlists.sort((a, b) => b.updateTime - a.updateTime);
            }
            
            return playlists;
        },
        totalCount() {
            return this.showCollected ? this.collectedPlaylists.length : this.filteredPlaylists.length;
        },
        userGenres() {
            const browseHistory = getBrowseHistory()
            const playHistory = getPlayHistory()
            const allHistory = [...browseHistory, ...playHistory]
            
            const genreCount = {}
            allHistory.forEach(item => {
                if (item.genres) {
                    item.genres.forEach(genre => {
                        genreCount[genre] = (genreCount[genre] || 0) + 1
                    })
                }
            })
            
            return Object.entries(genreCount)
                .sort((a, b) => b[1] - a[1])
                .map(([genre]) => genre)
                .slice(0, 5);
        }
    },
    methods: {
        sortBySimilarity(playlists) {
            const userGenres = this.userGenres
            
            return playlists.sort((a, b) => {
                const scoreA = this.calculateSimilarity(a, userGenres)
                const scoreB = this.calculateSimilarity(b, userGenres)
                return scoreB - scoreA
            })
        },
        calculateSimilarity(playlist, userGenres) {
            if (!playlist.tags || !userGenres.length) return 0
            
            return playlist.tags.filter(tag => userGenres.includes(tag)).length
        },
        toggleFavorite(playlist) {
            const index = this.collectedPlaylists.findIndex(p => p.id === playlist.id)
            
            if (index > -1) {
                this.collectedPlaylists.splice(index, 1)
            } else {
                this.collectedPlaylists.push(playlist)
            }
            
            saveCollectedPlaylists(this.collectedPlaylists)
        },
        isFavorite(playlistId) {
            return this.collectedPlaylists.some(p => p.id === playlistId)
        },
        toPlaylistDetail(playlistId) {
            addToBrowseHistory({
                id: playlistId,
                type: 'playlist',
                timestamp: Date.now()
            })
            this.$router.push(`/home/songList/${playlistId}`)
        },
        formatPlayCount(count) {
            if (count >= 10000) {
                return (count / 10000).toFixed(1) + '万'
            }
            return count
        },
        formatDate(timestamp) {
            const date = new Date(timestamp)
            return date.toLocaleDateString('zh-CN')
        },
        loadPlaylists() {
            this.allPlaylists = getMockPlaylists()
            this.collectedPlaylists = getCollectedPlaylists()
            
            const allTags = new Set()
            this.allPlaylists.forEach(p => {
                if (p.tags) {
                    p.tags.forEach(tag => allTags.add(tag))
                }
            })
            this.availableGenres = Array.from(allTags)
        }
    },
    watch: {
        activeTab() {
            this.currentPage = 1
        },
        selectedGenre() {
            this.currentPage = 1
        },
        showCollected() {
            this.currentPage = 1
        }
    },
    mounted() {
        this.loadPlaylists()
    }
}
</script>

<style scoped>
.playlist-square {
    padding: 20px;
    min-height: 100vh;
    background: #f5f5f5;
}

.header {
    text-align: center;
    padding: 30px 0;
}

.header h1 {
    font-size: 32px;
    margin-bottom: 10px;
    color: #333;
}

.header p {
    font-size: 14px;
    color: #999;
}

.tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.filter-bar {
    margin-bottom: 20px;
    padding: 15px 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-bar .filter-row {
    margin-bottom: 10px;
}

.filter-bar .filter-row:last-child {
    margin-bottom: 0;
}

.filter-bar .active {
    background: #d03535;
    color: white;
}

.genre-filter {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
}

.genre-filter span {
    margin-right: 8px;
    font-size: 14px;
    color: #666;
}

.playlist-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    padding: 0 10px;
}

.playlist-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
}

.playlist-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.cover-wrapper {
    position: relative;
    width: 100%;
    padding-top: 100%;
}

.cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 12px 12px 0 0;
}

.play-count {
    position: absolute;
    top: 8px;
    right: 8px;
    color: white;
    font-size: 12px;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    gap: 4px;
}

.favorite-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.3s;
}

.favorite-btn:hover {
    background: rgba(0, 0, 0, 0.7);
}

.favorite-btn i {
    font-size: 18px;
}

.play-overlay {
    position: absolute;
    bottom: 8px;
    left: 8px;
    opacity: 0;
    transition: opacity 0.3s;
}

.playlist-card:hover .play-overlay {
    opacity: 1;
}

.play-icon {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    padding: 5px;
}

.info {
    padding: 12px;
}

.info .name {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.info .creator {
    font-size: 12px;
    color: #999;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.info .tags {
    margin-bottom: 8px;
}

.info .update-time {
    font-size: 11px;
    color: #ccc;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 30px 0;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #999;
}

.empty-state i {
    font-size: 64px;
    margin-bottom: 16px;
}

.empty-state p {
    font-size: 16px;
}
</style>