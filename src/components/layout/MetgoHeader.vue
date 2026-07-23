<script setup>
import { computed, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { MapPin, LogOut, Settings, Sun, Moon, Activity } from 'lucide-vue-next'
import siteConfig from '@/site.config.js'

const site = inject('site', siteConfig)
const store = useStore()
const router = useRouter()
const route = useRoute()

const user = computed(() => store.state.user)
const preferences = computed(() => store.state.preferences)
const isAuthenticated = computed(() => store.getters.isAuthenticated)
const isDarkMode = computed(() => preferences.value.theme === 'dark')
const online = computed(() => typeof navigator !== 'undefined' ? navigator.onLine : true)

function setTempUnit(tempUnit) {
  store.dispatch('updatePreferences', { tempUnit })
}

function toggleTheme() {
  store.dispatch('updatePreferences', {
    theme: isDarkMode.value ? 'light' : 'dark',
  })
}

function logout() {
  store.dispatch('logout')
  if (route.meta?.requiresAuth) {
    router.push('/')
  }
}
</script>

<template>
  <header class="header">
    <div class="header__left">
      <div class="header__title-block">
        <h1 class="header__title">{{ site.copy?.headerTitle || 'Sistema de monitoreo' }}</h1>
        <p class="header__subtitle">
          <MapPin class="header__pin" aria-hidden="true" />
          {{ site.tagline }}
        </p>
      </div>
    </div>

    <div class="header__right">
      <div class="status-pill" :class="online ? 'status-pill--on' : 'status-pill--off'">
        <Activity class="status-pill__icon" aria-hidden="true" />
        {{ online ? 'En línea' : 'Sin conexión' }}
      </div>

      <div v-if="isAuthenticated && user" class="user-chip">
        {{ user.nombre || user.email }}
      </div>

      <div class="temp-unit-selector" role="group" aria-label="Unidad de temperatura">
        <button
          type="button"
          :class="['unit-btn', { active: preferences.tempUnit === 'C' }]"
          @click="setTempUnit('C')"
        >
          °C
        </button>
        <button
          type="button"
          :class="['unit-btn', { active: preferences.tempUnit === 'F' }]"
          @click="setTempUnit('F')"
        >
          °F
        </button>
      </div>

      <button
        type="button"
        class="header-icon-btn"
        :title="isDarkMode ? 'Modo claro' : 'Modo oscuro'"
        @click="toggleTheme"
      >
        <Sun v-if="isDarkMode" aria-hidden="true" />
        <Moon v-else aria-hidden="true" />
      </button>

      <router-link
        v-if="isAuthenticated"
        to="/preferencias-clima"
        class="header-link"
        title="Preferencias de clima"
      >
        <Settings aria-hidden="true" />
        <span class="sr-only">Preferencias</span>
      </router-link>

      <button
        v-if="isAuthenticated"
        type="button"
        class="btn-logout"
        title="Cerrar sesión"
        @click="logout"
      >
        <LogOut aria-hidden="true" />
        <span>Salir</span>
      </button>

      <router-link v-else to="/login" class="btn-logout">Iniciar sesión</router-link>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.5rem;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.header__title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text);
}

.header__subtitle {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--color-muted);
  margin-top: 0.15rem;
}

.header__pin {
  width: 0.9rem;
  height: 0.9rem;
}

.header__right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
}

.status-pill__icon {
  width: 0.85rem;
  height: 0.85rem;
}

.status-pill--on {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.status-pill--off {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.user-chip {
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.3rem 0.65rem;
  background: var(--color-primary-muted);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  max-width: 160px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.temp-unit-selector {
  display: flex;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.15rem;
  gap: 0.15rem;
}

.unit-btn {
  padding: 0.3rem 0.7rem;
  border: none;
  background: transparent;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--color-muted);
  font-family: inherit;
  transition: background 0.15s, color 0.15s;
}

.unit-btn.active {
  background: var(--color-primary);
  color: #0b1120;
  box-shadow: var(--glow-primary);
}

.header-icon-btn,
.header-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  cursor: pointer;
  text-decoration: none;
}

.header-icon-btn svg,
.header-link svg {
  width: 1rem;
  height: 1rem;
}

.header-icon-btn:hover,
.header-link:hover {
  background: var(--color-primary-muted);
  color: var(--color-primary);
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.btn-logout svg {
  width: 1rem;
  height: 1rem;
}

.btn-logout:hover {
  background: var(--color-primary-muted);
  border-color: var(--color-border-strong);
  color: var(--color-primary);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
