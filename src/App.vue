<template>
  <div v-if="isAuthPage" class="app-login">
    <router-view />
  </div>
  <div v-else class="app-shell">
    <MetgoHeader />
    <div class="app-body">
      <MetgoSidebar />
      <main class="app-main">
        <router-view :temp-unit="preferences.tempUnit" />
      </main>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import MetgoHeader from '@components/layout/MetgoHeader.vue'
import MetgoSidebar from '@components/layout/MetgoSidebar.vue'

export default {
  name: 'App',
  components: {
    MetgoHeader,
    MetgoSidebar,
  },
  computed: {
    ...mapState(['preferences']),
    isAuthPage() {
      return this.$route.name === 'Login' || this.$route.name === 'Registro'
    },
  },
}
</script>
