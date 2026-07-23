/**
 * Vue Router — METGO Paine (shell tipo Quillota)
 */

import { createRouter, createWebHistory } from 'vue-router'
import store from '@store/index.js'
import DashboardView from '@views/DashboardView.vue'
import Home from '@views/Home.vue'
import EstadoView from '@views/EstadoView.vue'
import PrecipitacionView from '@views/PrecipitacionView.vue'
import LugarDetalle from '@views/LugarDetalle.vue'
import Login from '@views/Login.vue'
import Registro from '@views/Registro.vue'
import Favoritos from '@views/Favoritos.vue'
import PreferenciasClima from '@views/PreferenciasClima.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { title: 'Panel general — METGO Paine' },
  },
  {
    path: '/estado',
    name: 'Estado',
    component: EstadoView,
    meta: { title: 'Estado sistema — METGO Paine' },
  },
  {
    path: '/meteo',
    name: 'Meteo',
    component: Home,
    meta: { title: 'Meteorología — METGO Paine' },
  },
  {
    path: '/meteo/precipitacion',
    name: 'Precipitacion',
    component: PrecipitacionView,
    meta: { title: 'Precipitación — METGO Paine' },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: 'Iniciar sesión', guestOnly: true },
  },
  {
    path: '/registro',
    name: 'Registro',
    component: Registro,
    meta: { title: 'Registro', guestOnly: true },
  },
  {
    path: '/favoritos',
    name: 'Favoritos',
    component: Favoritos,
    meta: { title: 'Mis favoritos', requiresAuth: true },
  },
  {
    path: '/preferencias-clima',
    name: 'PreferenciasClima',
    component: PreferenciasClima,
    meta: { title: 'Preferencias de clima', requiresAuth: true },
  },
  {
    path: '/lugar/:id',
    name: 'LugarDetalle',
    component: LugarDetalle,
    props: true,
    meta: { title: 'Detalle del lugar — METGO Paine' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  if (!['/login', '/registro'].includes(to.path)) {
    sessionStorage.setItem('lastRoute', to.fullPath)
  }

  document.title = to.meta.title || 'METGO Paine — Torres del Paine'

  if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (to.meta.guestOnly && store.getters.isAuthenticated) {
    next('/')
    return
  }

  next()
})

export default router
