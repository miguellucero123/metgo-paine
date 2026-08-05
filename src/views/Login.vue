<template>
  <div class="auth-page">
    <div class="auth-panel">
      <div class="auth-lang">
        <ThemeToggle />
      </div>
      <div class="auth-brand">
        <div class="auth-logo">
          <Mountain aria-hidden="true" />
        </div>
        <h1>METGO</h1>
        <p class="auth-tagline">Clima y criósfera</p>
        <p class="auth-region">Torres del Paine · Circuitos W y O</p>
        <p class="login-hint muted">Acceso restringido · JWT METGO</p>
      </div>

      <form class="auth-form" @submit.prevent="onSubmit">
        <label class="field">
          <span>Usuario</span>
          <input
            v-model.trim="username"
            type="text"
            autocomplete="username"
            required
          />
        </label>

        <label class="field">
          <span>Contraseña</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
          />
        </label>

        <p v-if="error" class="auth-msg auth-msg--error" role="alert">{{ error }}</p>

        <button type="submit" class="btn btn--full" :disabled="loading">
          <LogIn class="btn-icon" aria-hidden="true" />
          {{ loading ? 'Entrando…' : 'Entrar' }}
        </button>
      </form>

      <p class="auth-footer">
        ¿No tienes cuenta?
        <router-link to="/registro">Solicitar acceso</router-link>
        ·
        <router-link to="/">Landing</router-link>
      </p>
      <p class="hint">Panel en /app · JWT metgo-api · sitio paine</p>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { LogIn, Mountain } from 'lucide-vue-next'
import { sanitizeRedirectPath } from '@utils/sanitizeRedirectPath.js'
import { wakeApi } from '@services/authApi.js'
import ThemeToggle from '@/components/layout/ThemeToggle.vue'

export default {
  name: 'LoginView',
  components: { LogIn, Mountain, ThemeToggle },
  data() {
    return {
      username: '',
      password: '',
      error: '',
      loading: false,
    }
  },
  mounted() {
    wakeApi().catch(() => {})
  },
  methods: {
    ...mapActions(['login']),
    async onSubmit() {
      this.error = ''
      this.loading = true
      try {
        try {
          await wakeApi()
        } catch (e) {
          this.error = e?.message || 'No se pudo contactar la API. Reintente en un minuto.'
          return
        }
        await this.login({
          username: this.username,
          password: this.password,
        })
        const q = this.$route.query.redirect
        const fromSession = sessionStorage.getItem('lastRoute')
        const raw = (typeof q === 'string' && q) || fromSession || '/app'
        const target = sanitizeRedirectPath(raw)
        sessionStorage.removeItem('lastRoute')
        await this.$router.replace(target)
      } catch (e) {
        this.error = e?.message || 'Usuario o contraseña incorrectos'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.auth-lang {
  display: flex;
  justify-content: flex-end;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}
</style>
