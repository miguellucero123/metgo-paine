<template>
  <div class="auth-page">
    <div class="auth-panel">
      <div class="auth-brand">
        <div class="auth-logo">
          <Mountain aria-hidden="true" />
        </div>
        <h1>METGO</h1>
        <p class="auth-tagline">Crear cuenta</p>
        <p class="auth-region">Torres del Paine · registro local</p>
      </div>

      <form @submit.prevent="onSubmit">
        <label class="field">
          <span>Nombre</span>
          <input
            v-model.trim="nombre"
            type="text"
            required
            minlength="2"
            placeholder="Tu nombre"
          />
        </label>

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
            autocomplete="new-password"
            required
            minlength="4"
            placeholder="Mínimo 4 caracteres"
          />
        </label>

        <p v-if="error" class="auth-msg auth-msg--error" role="alert">{{ error }}</p>

        <button type="submit" class="btn btn--full" :disabled="loading">
          <UserPlus class="btn-icon" aria-hidden="true" />
          {{ loading ? 'Creando…' : 'Registrarme' }}
        </button>
      </form>

      <p class="auth-footer">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión</router-link>
      </p>
      <p class="hint">Los datos se guardan solo en tu navegador (demo)</p>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { UserPlus, Mountain } from 'lucide-vue-next'
import { sanitizeRedirectPath } from '@utils/sanitizeRedirectPath.js'

export default {
  name: 'RegistroView',
  components: { UserPlus, Mountain },
  data() {
    return {
      nombre: '',
      email: '',
      password: '',
      error: '',
      loading: false,
    }
  },
  methods: {
    ...mapActions(['register']),
    async onSubmit() {
      this.error = ''
      this.loading = true
      try {
        await this.register({
          nombre: this.nombre,
          email: this.email,
          password: this.password,
        })
        const q = this.$route.query.redirect
        const raw = (typeof q === 'string' && q) || '/'
        await this.$router.replace(sanitizeRedirectPath(raw))
      } catch (e) {
        this.error = e?.message || 'No se pudo completar el registro'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
