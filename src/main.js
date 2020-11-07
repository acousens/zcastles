import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import VueCompositionApi from '@vue/composition-api';

Vue.use(VueCompositionApi);

Vue.config.productionTip = false

new Vue({
  data() {
    return {
      api: window.location.origin + '/api',
    }
  },
  router,
  store,
  render: h => h(App)
}).$mount('#app')
