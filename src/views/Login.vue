<template>
  <div class="auth-page">
    <div class="auth-panel">
      <div class="auth-brand">
        <div class="auth-logo">
          <Mountain aria-hidden="true" />
        </div>
        <h1>METGO</h1>
        <p class="auth-tagline">Clima y criósfera</p>
        <p class="auth-region">Torres del Paine · Circuitos W y O</p>
      </div>

      <form @submit.prevent="onSubmit">
        <label class="field">
          <span>Correo electrónico</span>
          <input
            v-model.trim="email"
            type="email"
            autocomplete="email"
            required
            placeholder="tu@correo.cl"
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
        <router-link to="/registro">Regístrate</router-link>
      </p>
      <p class="hint">Auth local (navegador) · favoritos y preferencias</p>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { LogIn, Mountain } from 'lucide-vue-next'
import { sanitizeRedirectPath } from '@utils/sanitizeRedirectPath.js'

export default {
  name: 'LoginView',
  components: { LogIn, Mountain },
  data() {
    return {
      email: '',
      password: '',
      error: '',
      loading: false,
    }
  },
  methods: {
    ...mapActions(['login']),
    async onSubmit() {
      this.error = ''
      this.loading = true
      try {
        await this.login({
          email: this.email,
          password: this.password,
        })
        const q = this.$route.query.redirect
        const fromSession = sessionStorage.getItem('lastRoute')
        const raw = (typeof q === 'string' && q) || fromSession || '/'
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
