<template>
  <div v-if="isAuthPage" class="app-login">
    <router-view />
  </div>
  <div v-else class="app-shell" :class="{ 'app-shell--nav-open': navOpen }">
    <a href="#contenido-principal" class="skip-link">Saltar al contenido</a>
    <OfflineBanner />
    <MetgoHeader />
    <div class="app-body">
      <div
        class="nav-backdrop"
        :class="{ 'nav-backdrop--visible': navOpen }"
        aria-hidden="true"
        @click="navOpen = false"
      />
      <MetgoSidebar />
      <main id="contenido-principal" class="app-main" tabindex="-1">
        <router-view :temp-unit="preferences.tempUnit" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import MetgoHeader from '@components/layout/MetgoHeader.vue'
import MetgoSidebar from '@components/layout/MetgoSidebar.vue'
import OfflineBanner from '@components/layout/OfflineBanner.vue'

const store = useStore()
const route = useRoute()

const navOpen = ref(false)
provide('navOpen', navOpen)
provide('toggleNav', () => {
  navOpen.value = !navOpen.value
})
provide('closeNav', () => {
  navOpen.value = false
})

const preferences = computed(() => store.state.preferences)
const isAuthPage = computed(
  () => route.name === 'Login' || route.name === 'Registro'
)

watch(
  () => route.fullPath,
  () => {
    navOpen.value = false
  }
)
</script>
