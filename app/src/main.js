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
// 引入vue-lazyload
import VueLazyload from 'vue-lazyload'
// 注册vue-lazyload
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
  loading: 'https://p1.music.126.net/6y-UleORITEDbvrOLV0Q8A==/5639395138885805.jpg',
  attempt: 1
})
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
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
