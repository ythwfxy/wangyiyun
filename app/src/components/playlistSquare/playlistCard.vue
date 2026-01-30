<template>
    <div class="playlist-card" @click="goToDetail">
        <div class="cover-wrapper">
            <img :src="playlist.coverImgUrl" alt="" class="cover">
            <div class="play-count">
                <i class="el-icon-headset"></i>
                <span>{{ formatCount(playlist.playCount) }}</span>
            </div>
            <div class="favorite-btn" @click.stop="toggleFavorite">
                <i :class="isFavorite ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
            </div>
        </div>
        <div class="info">
            <h3 class="name" :title="playlist.name">{{ playlist.name }}</h3>
            <div class="creator">
                <el-avatar :src="playlist.creator.avatarUrl" size="24"></el-avatar>
                <span class="creator-name">{{ playlist.creator.nickname }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import { addFavoritePlaylist, removeFavoritePlaylist, isFavoritePlaylist } from '@/utils/storage'

export default {
    name: 'PlaylistCard',
    props: {
        playlist: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isFavorite: false
        }
    },
    watch: {
        playlist: {
            immediate: true,
            handler() {
                this.checkFavorite()
            }
        }
    },
    methods: {
        formatCount(count) {
            if (count >= 100000000) {
                return (count / 100000000).toFixed(1) + '亿'
            } else if (count >= 10000) {
                return (count / 10000).toFixed(1) + '万'
            }
            return count.toString()
        },
        goToDetail() {
            this.$router.push(`/home/songList/${this.playlist.id}`)
        },
        checkFavorite() {
            this.isFavorite = isFavoritePlaylist(this.playlist.id)
        },
        toggleFavorite() {
            if (this.isFavorite) {
                removeFavoritePlaylist(this.playlist.id)
                this.$message.success('取消收藏成功')
            } else {
                addFavoritePlaylist(this.playlist)
                this.$message.success('收藏成功')
            }
            this.isFavorite = !this.isFavorite
            this.$emit('favorite-change')
        }
    }
}
</script>

<style scoped>
.playlist-card {
    width: 180px;
    cursor: pointer;
    transition: transform 0.2s;
}

.playlist-card:hover {
    transform: translateY(-5px);
}

.cover-wrapper {
    position: relative;
    width: 180px;
    height: 180px;
    border-radius: 8px;
    overflow: hidden;
}

.cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.play-count {
    position: absolute;
    top: 5px;
    right: 5px;
    display: flex;
    align-items: center;
    gap: 3px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.favorite-btn {
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
}

.favorite-btn:hover {
    background: #fff;
    transform: scale(1.1);
}

.favorite-btn i {
    font-size: 18px;
    color: #c62f2f;
}

.info {
    padding: 10px 0;
}

.name {
    font-size: 14px;
    color: #333;
    margin: 0 0 8px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.creator {
    display: flex;
    align-items: center;
    gap: 8px;
}

.creator-name {
    font-size: 12px;
    color: #999;
}
</style>
