<template>
    <div class="playlist-square">
        <div class="header">
            <h2>歌单广场</h2>
            <div class="tabs">
                <span 
                    class="tab" 
                    :class="{ active: activeTab === 'recommend' }"
                    @click="activeTab = 'recommend'"
                >
                    个性化推荐
                </span>
                <span 
                    class="tab" 
                    :class="{ active: activeTab === 'favorite' }"
                    @click="activeTab = 'favorite'"
                >
                    我的收藏
                </span>
            </div>
        </div>

        <div v-if="activeTab === 'recommend'" class="recommend-content">
            <div class="recommend-tabs">
                <span 
                    class="recommend-tab" 
                    :class="{ active: recommendType === 'style' }"
                    @click="recommendType = 'style'"
                >
                    <i class="el-icon-magic-stick"></i>
                    相似曲风
                </span>
                <span 
                    class="recommend-tab" 
                    :class="{ active: recommendType === 'hot' }"
                    @click="recommendType = 'hot'"
                >
                    <i class="el-icon-fire"></i>
                    热门程度
                </span>
                <span 
                    class="recommend-tab" 
                    :class="{ active: recommendType === 'latest' }"
                    @click="recommendType = 'latest'"
                >
                    <i class="el-icon-time"></i>
                    最新更新
                </span>
            </div>

            <div class="playlist-grid">
                <playlist-card 
                    v-for="playlist in currentPlaylists" 
                    :key="playlist.id"
                    :playlist="playlist"
                    @favorite-change="handleFavoriteChange"
                ></playlist-card>
            </div>

            <div v-if="currentPlaylists.length === 0" class="empty-tip">
                <i class="el-icon-folder-opened"></i>
                <p>暂无推荐歌单</p>
            </div>
        </div>

        <div v-else class="favorite-content">
            <div class="favorite-header">
                <span>共收藏 {{ favoritePlaylists.length }} 个歌单</span>
            </div>

            <div v-if="favoritePlaylists.length > 0" class="favorite-grid">
                <div class="playlist-grid">
                    <playlist-card 
                        v-for="playlist in paginatedFavorites" 
                        :key="playlist.id"
                        :playlist="playlist"
                        @favorite-change="handleFavoriteChange"
                    ></playlist-card>
                </div>

                <div class="pagination-wrapper">
                    <el-pagination
                        background
                        layout="prev, pager, next"
                        :total="favoritePlaylists.length"
                        :page-size="pageSize"
                        :current-page.sync="currentPage"
                    ></el-pagination>
                </div>
            </div>

            <div v-else class="empty-tip">
                <i class="el-icon-star-off"></i>
                <p>暂无收藏的歌单</p>
                <p class="sub-tip">快去发现喜欢的歌单吧~</p>
            </div>
        </div>
    </div>
</template>

<script>
import PlaylistCard from '@/components/playlistSquare/playlistCard'
import { mockPlaylists, getPlaylistsByStyle, getPlaylistsByHot, getPlaylistsByLatest } from '@/mock/playlistData'
import { getFavoritePlaylists, getPlayHistory } from '@/utils/storage'

export default {
    name: 'PlaylistSquare',
    components: {
        PlaylistCard
    },
    data() {
        return {
            activeTab: 'recommend',
            recommendType: 'style',
            currentPage: 1,
            pageSize: 8,
            allPlaylists: mockPlaylists,
            favoritePlaylists: []
        }
    },
    computed: {
        currentPlaylists() {
            switch (this.recommendType) {
                case 'style':
                    return this.getStyleBasedPlaylists()
                case 'hot':
                    return getPlaylistsByHot()
                case 'latest':
                    return getPlaylistsByLatest()
                default:
                    return this.allPlaylists
            }
        },
        paginatedFavorites() {
            const start = (this.currentPage - 1) * this.pageSize
            const end = start + this.pageSize
            return this.favoritePlaylists.slice(start, end)
        }
    },
    watch: {
        activeTab() {
            this.currentPage = 1
        }
    },
    created() {
        this.loadFavorites()
    },
    methods: {
        getStyleBasedPlaylists() {
            const history = getPlayHistory()
            const tagMap = {}
            
            history.forEach(song => {
                if (song.tags && Array.isArray(song.tags)) {
                    song.tags.forEach(tag => {
                        tagMap[tag] = (tagMap[tag] || 0) + 1
                    })
                }
            })

            const sortedTags = Object.entries(tagMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(item => item[0])

            if (sortedTags.length === 0) {
                return getPlaylistsByHot()
            }

            const result = getPlaylistsByStyle(sortedTags)
            return result.length > 0 ? result : getPlaylistsByHot()
        },
        loadFavorites() {
            this.favoritePlaylists = getFavoritePlaylists()
        },
        handleFavoriteChange() {
            this.loadFavorites()
        }
    }
}
</script>

<style scoped>
.playlist-square {
    padding: 20px;
    min-height: 100%;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
}

.header h2 {
    margin: 0;
    font-size: 24px;
    color: #333;
}

.tabs {
    display: flex;
    gap: 20px;
}

.tab {
    font-size: 16px;
    color: #999;
    cursor: pointer;
    padding: 5px 0;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}

.tab:hover {
    color: #666;
}

.tab.active {
    color: #c62f2f;
    border-bottom-color: #c62f2f;
}

.recommend-tabs {
    display: flex;
    gap: 15px;
    margin-bottom: 25px;
}

.recommend-tab {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 20px;
    background: #f5f5f5;
    border-radius: 20px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.2s;
}

.recommend-tab:hover {
    background: #e8e8e8;
}

.recommend-tab.active {
    background: #c62f2f;
    color: #fff;
}

.recommend-tab i {
    font-size: 16px;
}

.playlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 25px;
}

.empty-tip {
    text-align: center;
    padding: 80px 20px;
    color: #999;
}

.empty-tip i {
    font-size: 64px;
    color: #ddd;
}

.empty-tip p {
    margin: 15px 0 0 0;
    font-size: 16px;
}

.empty-tip .sub-tip {
    font-size: 14px;
    color: #bbb;
    margin-top: 5px;
}

.favorite-header {
    margin-bottom: 20px;
    font-size: 14px;
    color: #999;
}

.favorite-grid {
    min-height: 400px;
}

.pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 40px;
}
</style>
