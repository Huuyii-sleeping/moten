import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/mian.scss'
import { Icon } from '@iconify/vue'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('icon', Icon)

app.mount('#app')
