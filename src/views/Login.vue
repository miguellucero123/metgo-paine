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
        <p v-if="paso === 'activar'" class="auth-msg">
          Su cuenta exige doble factor. Agregue la clave en el autenticador y escriba el código de 6 dígitos.
        </p>
        <p v-if="paso === 'activar'"><code>{{ semilla && semilla.secret }}</code></p>
        <label v-if="paso === 'credenciales'" class="field">
          <span>Correo</span>
          <input
            v-model.trim="username"
            type="email"
            autocomplete="email"
            required
          />
        </label>

        <label v-if="paso === 'credenciales'" class="field">
          <span>Contraseña</span>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
          />
        </label>
        <label v-if="paso !== 'credenciales'" class="field">
          <span>Código del autenticador</span>
          <input v-model="mfaCode" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required />
        </label>

        <p v-if="error" class="auth-msg auth-msg--error" role="alert">{{ error }}</p>

        <button type="submit" class="btn btn--full" :disabled="loading">
          <LogIn class="btn-icon" aria-hidden="true" />
          {{ loading ? 'Entrando…' : (paso === 'activar' ? 'Activar y entrar' : 'Entrar') }}
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
import { wakeApi, mfaSetup, mfaActivar } from '@services/authApi.js'
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
      paso: 'credenciales',
      mfaCode: '',
      tokenActivacion: '',
      semilla: null,
    }
  },
  mounted() {
    wakeApi().catch(() => {})
  },
  methods: {
    ...mapActions(['login', 'adoptSession']),
    async onSubmit() {
      this.error = ''
      this.loading = true
      try {
        if (this.paso === 'activar') {
          const data = await mfaActivar(this.tokenActivacion, this.mfaCode.trim())
          await this.adoptSession(data)
        } else {
          try {
            await wakeApi()
          } catch (e) {
            this.error = e?.message || 'No se pudo contactar la API. Reintente en un minuto.'
            return
          }
          await this.login({
            username: this.username,
            password: this.password,
            mfaCode: this.mfaCode.trim(),
          })
        }
        const q = this.$route.query.redirect
        const fromSession = sessionStorage.getItem('lastRoute')
        const raw = (typeof q === 'string' && q) || fromSession || '/app'
        const target = sanitizeRedirectPath(raw)
        sessionStorage.removeItem('lastRoute')
        await this.$router.replace(target)
      } catch (e) {
        if (e?.code === 'mfa_required' || e?.code === 'mfa_invalid') {
          this.error = e.message || 'Ingrese el código del autenticador'
          this.paso = 'codigo'
          this.mfaCode = ''
          return
        }
        if (e?.code === 'mfa_setup' && e.access_token) {
          this.tokenActivacion = e.access_token
          this.semilla = await mfaSetup(e.access_token)
          this.paso = 'activar'
          this.mfaCode = ''
          return
        }
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
