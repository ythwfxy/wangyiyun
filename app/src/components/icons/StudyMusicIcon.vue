<template>
  <svg class="study-music-icon" :class="{ active: isActive }" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 书本形状 -->
    <path d="M4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V4C20 3.46957 19.7893 2.96086 19.4142 2.58579C19.0391 2.21071 18.5304 2 18 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4Z" stroke="currentColor" stroke-width="2"/>
    <!-- 书本线条 -->
    <path d="M8 2V22" stroke="currentColor" stroke-width="1" stroke-dasharray="2 4"/>
    <!-- 音符形状 -->
    <path d="M14 12C14 13.1046 13.1046 14 12 14C10.8954 14 10 13.1046 10 12C10 10.8954 10.8954 10 12 10C12.5523 10 13 10.4477 13 11V14C13 14.5523 12.5523 15 12 15C11.4477 15 11 14.5523 11 14V12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script>
export default {
  name: 'StudyMusicIcon',
  props: {
    isActive: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.study-music-icon {
  width: 24px;
  height: 24px;
  transition: all 0.3s ease;
}

.study-music-icon.active {
  background: linear-gradient(135deg, #4CAF50, #2196F3);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transform: scale(1.1);
}
</style>