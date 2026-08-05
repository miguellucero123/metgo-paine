/**
 * Vue Router — METGO Paine
 * / = landing pública · /app = panel (JWT) · resto requiere sesión
 */

import { createRouter, createWebHistory } from 'vue-router'
import store from '@store/index.js'
import { ensureValidSession } from '@services/authService.js'
import { getToken } from '@services/authApi.js'
import site from '@/site.config.js'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('@views/LandingPaineView.vue'),
    meta: { title: 'METGO Paine — Glaciares · Torres del Paine', public: true },
  },
  {
    path: '/app',
    name: 'Dashboard',
    component: () => import('@views/DashboardView.vue'),
    meta: { title: 'Panel general — METGO Paine' },
  },
  {
    path: '/dashboard',
    redirect: { name: 'Dashboard' },
  },
  {
    path: '/estado',
    name: 'Estado',
    component: () => import('@views/EstadoView.vue'),
    meta: { title: 'Estado sistema — METGO Paine' },
  },
  {
    path: '/meteo',
    name: 'Meteo',
    component: () => import('@views/Home.vue'),
    meta: { title: 'Meteorología — METGO Paine' },
  },
  {
    path: '/meteo/precipitacion',
    name: 'Precipitacion',
    component: () => import('@views/PrecipitacionView.vue'),
    meta: { title: 'Precipitación — METGO Paine' },
  },
  ...(site.modules?.carretera
    ? [
        {
          path: '/carretera',
          name: 'CarreteraAustral',
          component: () => import('@views/CarreteraMapView.vue'),
          meta: { title: 'Carretera Austral — METGO Paine' },
        },
      ]
    : []),
  {
    path: '/login',
    name: 'Login',
    component: () => import('@views/Login.vue'),
    meta: { title: 'Iniciar sesión', public: true, guestOnly: true },
  },
  {
    path: '/registro',
    name: 'Registro',
    component: () => import('@views/Registro.vue'),
    meta: { title: 'Registro', public: true, guestOnly: true },
  },
  {
    path: '/verificar',
    name: 'Verificar',
    component: () => import('@views/VerificarEmail.vue'),
    meta: { title: 'Verificar email', public: true },
  },
  {
    path: '/favoritos',
    name: 'Favoritos',
    component: () => import('@views/Favoritos.vue'),
    meta: { title: 'Mis favoritos' },
  },
  {
    path: '/preferencias-clima',
    name: 'PreferenciasClima',
    component: () => import('@views/PreferenciasClima.vue'),
    meta: { title: 'Preferencias de clima' },
  },
  {
    path: '/lugar/:id',
    name: 'LugarDetalle',
    component: () => import('@views/LugarDetalle.vue'),
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

router.beforeEach(async (to, from, next) => {
  if (!to.meta.public) {
    sessionStorage.setItem('lastRoute', to.fullPath)
  }

  document.title = to.meta.title || site.documentTitle || 'METGO Paine'

  // Rutas públicas: landing siempre accesible; login/registro solo si NO hay JWT válido
  if (to.meta.public) {
    if (to.meta.guestOnly && getToken()) {
      const user = await ensureValidSession()
      if (user) {
        next({ name: 'Dashboard' })
        return
      }
      store.dispatch('logout')
    }
    next()
    return
  }

  // Panel y resto: JWT obligatorio
  if (!getToken() || !store.getters.isAuthenticated) {
    if (store.state.user) store.dispatch('logout')
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  const user = await ensureValidSession()
  if (!user) {
    store.dispatch('logout')
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  next()
})

export default router
