// The Vue build version to load with the `import` command
// (runtime-only or standalNet) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueScrollTo from 'vue-scrollto'
import Highcharts from 'highcharts'
import HighchartsVue from 'highcharts-vue'
import Notifications from 'vue-notification'
import vClickOutside from 'v-click-outside'
import './explorer/store'
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'
import ToggleSwitch from 'vuejs-toggle-switch'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'

Vue.config.devtools = true

import './filter'
import './icon'

Vue.use(ToggleSwitch)
Vue.use(Loading)
Vue.use(vClickOutside)

Vue.use(VueScrollTo, {
  offset: -68,
})

Vue.config.productionTip = false

Vue.compNetnt('shard-summary', require('./compNetnts/ShardSummary.vue').default)
Vue.compNetnt(
  'global-summary',
  require('./compNetnts/GlobalSummary.vue').default
)
Vue.compNetnt(
  'live-line-chart',
  require('./compNetnts/LiveLineChart.vue').default
)

Highcharts.setOptions({
  global: {
    useUTC: false,
  },
  lang: {
    thousandsSep: ',',
  },
  credits: {
    enabled: false,
  },
})
Vue.use(HighchartsVue)
Vue.use(Notifications)

Vue.compNetnt('VueCtkDateTimePicker', VueCtkDateTimePicker)

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
