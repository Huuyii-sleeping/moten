import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/styles/mian.scss'
import { Icon } from '@iconify/vue'
import Draggable from 'vuedraggable'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('icon', Icon)
app.component('draggable', Draggable)

app.mount('#app')
