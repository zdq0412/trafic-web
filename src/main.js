import Vue from 'vue';
import qs from 'qs'
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import VueI18n from 'vue-i18n';
import axios from 'axios';
import { messages } from './components/common/i18n';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
import './assets/css/icon.css';
import './components/common/directives';
import 'babel-polyfill';
import Print from 'vue-print-nb'
Vue.prototype.$qs = qs;
//Vue.prototype.$baseURL='http://47.99.164.110:8088';
Vue.prototype.$baseURL='http://192.168.0.107:8088';
Vue.prototype.$axios = axios.create({
   //baseURL:"http://47.99.164.110:8088",
   baseURL:"http://192.168.0.107:8088",
    transformRequest:[function(data,header){
       header.token = localStorage.getItem("token");
        return data;
    }],
    transformResponse: [function (res) {//返回的res为json字符串，非json对象
        let jsonObj = JSON.parse(res);
        if(jsonObj.result){
            if(jsonObj.result.resultCode==600){
                localStorage.removeItem("username");
                localStorage.removeItem("token");
                router.push("/login");
            }
        }
        return jsonObj;
    }],
    headers: {
        'token': ''
    },
    withCredentials:true
});
Vue.config.productionTip = false;
Vue.use(VueI18n);
Vue.use(Print);
Vue.use(ElementUI, {
    size: 'small'
});
const i18n = new VueI18n({
    locale: 'zh',
    messages
});
//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} `;
    next();
});
new Vue({
    router,
    i18n,
    render: h => h(App)
}).$mount('#app');
