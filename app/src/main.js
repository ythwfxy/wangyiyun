import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import axios from 'axios'
import store from './store'
import '@/plugins/element.js'
import '@/assets/styles/global.css'
Vue.config.productionTip = false
// 引入阿里图标
import '@/assets/iconfonts/iconfont.css'
// 配置axios
axios.defaults.baseURL = 'http://localhost:3000/'
Vue.prototype.$http = axios
Vue.filter('myFilter', function (value) {
  let minutes = Math.floor(value / 60000)
  let seconds = ((value % 60000) / 1000).toFixed(0)
  return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`
})
Vue.filter('timeFormat', function (time) {

  //分钟
  var minute = time / 60;
  var minutes = parseInt(minute);

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  //秒
  var second = time % 60;
  var seconds = Math.floor(second);
  if (seconds < 10) {
    seconds = "0" + seconds;
  }
  return `${minutes}:${seconds}`;
})
//全局vue过滤器(时间戳过滤器)
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDay() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
//全局vue过滤器(时间戳过滤器)
Vue.filter('dateFormat1', function (originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDay() + '').padStart(2, '0')
  return `${y}-${m}-${d}`
})
// 初始化mock歌单数据
if (!sessionStorage.getItem('personalList')) {
  const mockPlaylists = [
    {
      id: 1,
      name: '通勤听',
      coverImgUrl: 'https://p2.music.126.net/c999M4z68h2U0d24V0qf1Q==/109951169111425214.jpg',
      trackCount: 30
    },
    {
      id: 2,
      name: '睡前放松',
      coverImgUrl: 'https://p2.music.126.net/9K1-11jH6Vv8D2V8x8D8w==/109951169234567890.jpg',
      trackCount: 25
    },
    {
      id: 3,
      name: '运动健身',
      coverImgUrl: 'https://p2.music.126.net/8J2-12jH7Vv7D1V7x7D7w==/109951169345678901.jpg',
      trackCount: 45
    },
    {
      id: 4,
      name: '工作学习',
      coverImgUrl: 'https://p2.music.126.net/7K3-13jH6Vv6D0V6x6D6w==/109951169456789012.jpg',
      trackCount: 20
    },
    {
      id: 5,
      name: '怀旧金曲',
      coverImgUrl: 'https://p2.music.126.net/6K4-14jH5Vv5D9V5x5D5w==/109951169567890123.jpg',
      trackCount: 50
    },
    {
      id: 6,
      name: '热门新歌',
      coverImgUrl: 'https://p2.music.126.net/5K5-15jH4Vv4D8V4x4D4w==/109951169678901234.jpg',
      trackCount: 35
    }
  ]
  sessionStorage.setItem('personalList', JSON.stringify(mockPlaylists))
}

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
