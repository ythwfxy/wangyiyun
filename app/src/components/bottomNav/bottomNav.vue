<template>
  <div class="bottom-nav">
    <div class="nav-item" :class="{ active: $route.path === '/home/findMusic' }" @click="$router.push('/home/findMusic')">
      <i class="iconfont icon-shouye"></i>
      <span>首页</span>
    </div>
    <div class="nav-item" :class="{ active: $route.path === '/home/myFM' }" @click="$router.push('/home/myFM')">
      <i class="iconfont icon-wode"></i>
      <span>我的</span>
    </div>
    <div class="nav-item" :class="{ active: $route.path === '/home/music-cosmos' }" @click="$router.push('/home/music-cosmos')">
      <svg class="cosmos-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
        <path d="M2 12h20"></path>
      </svg>
      <span>宇宙</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BottomNav',
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: rgba(10, 10, 15, 0.95);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 200;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 5px 10px;
}

.nav-item:hover {
  color: #fff;
}

.nav-item.active {
  color: #667eea;
}

.nav-item i {
  font-size: 20px;
}

.cosmos-icon {
  width: 20px;
  height: 20px;
}

.nav-item span {
  font-size: 12px;
}
</style>