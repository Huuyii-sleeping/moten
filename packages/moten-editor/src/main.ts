import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/mian.scss'
import { Icon } from '@iconify/vue'
import Draggable from 'vuedraggable'
import moten from '@moten/ui'
import '@moten/ui/dist/theme/moten.css'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import { useUserStore } from './stores/user'
import { getToken } from './utils/store'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const app = createApp(App)
app.use(createPinia())
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.use(ElementPlus)
app.use<{ platform: 'editor' | 'user' }>(moten, { platform: 'editor' })
app.use(router)
app.component('icon', Icon)
app.component('draggable', Draggable)
app.component('QuillEditor', QuillEditor)
app.mount('#app')

const userStore = useUserStore()
userStore.setToken(getToken())
