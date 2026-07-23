import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import site from './site.config'
import { applySiteTheme } from './utils/applySiteTheme'

import './styles/main.css'
import './styles/auth-page.css'

applySiteTheme(site)

const app = createApp(App)
app.provide('site', site)
app.config.globalProperties.$site = site

app.use(store)
app.use(router)

app.mount('#app')

console.log(`${site.productName} ${site.siteLabel} SPA iniciado (Vue 3 + Vuex)`)
