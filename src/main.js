import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './styles/main.css'
import './styles/auth-page.css'

const app = createApp(App)

app.use(store)
app.use(router)

app.mount('#app')

console.log('METGO Paine SPA iniciado (Vue 3 + Vuex)')
