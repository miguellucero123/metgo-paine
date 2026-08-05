<template>
  <div class="auth-page">
    <div class="auth-panel wide">
      <div class="top">
        <ThemeToggle />
        <router-link to="/">Inicio</router-link>
      </div>
      <div class="brand">
        <div class="logo"><Mountain aria-hidden="true" /></div>
        <h1>Registro METGO Paine</h1>
        <p>Piloto 15 días · verificación por email · acceso al panel en /app</p>
      </div>

      <form class="grid" @submit.prevent="onSubmit">
        <label><span>Nombres</span><input v-model="form.nombres" required /></label>
        <label><span>Apellidos</span><input v-model="form.apellidos" required /></label>
        <label><span>Email</span><input v-model="form.email" type="email" required /></label>
        <label><span>Teléfono</span><input v-model="form.telefono" placeholder="+56912345678" /></label>
        <label><span>Razón social</span><input v-model="form.razon_social" required /></label>
        <label><span>RUT empresa</span><input v-model="form.rut" required placeholder="76.123.456-0" /></label>
        <label><span>Contraseña</span><input v-model="form.password" type="password" required minlength="10" /></label>
        <label><span>Confirmar</span><input v-model="form.password_confirm" type="password" required /></label>

        <fieldset class="consents">
          <legend>Consentimientos</legend>
          <label class="check">
            <input v-model="form.almacenamiento_datos" type="checkbox" />
            Autorizo el almacenamiento de mis datos para operar el servicio.
          </label>
          <label class="check">
            <input v-model="form.tos" type="checkbox" />
            Acepto términos de uso.
          </label>
          <label class="check">
            <input v-model="form.privacy" type="checkbox" />
            Acepto política de privacidad.
          </label>
          <label class="check">
            <input v-model="form.veracidad" type="checkbox" />
            Declaro que la información es veraz.
          </label>
        </fieldset>

        <div v-if="Object.keys(errors).length" class="err" role="alert">
          <div v-for="(msgs, k) in errors" :key="k">
            <strong>{{ k }}:</strong> {{ msgs.join('; ') }}
          </div>
        </div>
        <p v-if="msg" class="ok">{{ msg }}</p>

        <button type="submit" class="btn-primary" :disabled="cargando">
          {{ cargando ? 'Enviando…' : 'Crear cuenta' }}
        </button>
      </form>

      <section v-if="planes.length" class="planes">
        <h2>Planes disponibles</h2>
        <ul>
          <li v-for="p in planes" :key="p.plan_code">
            <strong>{{ p.nombre }}</strong>
            <span class="feats"> — {{ p.descripcion || (p.features || []).join(', ') }}</span>
          </li>
        </ul>
      </section>

      <p class="foot">
        ¿Ya tienes cuenta?
        <router-link to="/login">Inicia sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mountain } from 'lucide-vue-next'
import { fetchPlanes, registerV2, validateRegistro, wakeApi, SITIO } from '@/services/authApi'
import ThemeToggle from '@/components/layout/ThemeToggle.vue'

const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  password_confirm: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  razon_social: '',
  rut: '',
  almacenamiento_datos: false,
  tos: false,
  privacy: false,
  veracidad: false,
})

const errors = ref({})
const msg = ref('')
const cargando = ref(false)
const planes = ref([])

onMounted(async () => {
  wakeApi().catch(() => {})
  try {
    const data = await fetchPlanes(SITIO)
    planes.value = (data.planes || []).filter((p) => p.plan_code !== 'preview')
  } catch {
    planes.value = []
  }
})

async function onSubmit() {
  msg.value = ''
  errors.value = {}
  cargando.value = true
  const body = {
    email: form.email.trim(),
    password: form.password,
    password_confirm: form.password_confirm,
    nombres: form.nombres.trim(),
    apellidos: form.apellidos.trim(),
    telefono: form.telefono.trim(),
    razon_social: form.razon_social.trim(),
    rut: form.rut.trim(),
    sitio: SITIO,
    consentimientos: {
      almacenamiento_datos: form.almacenamiento_datos,
      tos: form.tos,
      privacy: form.privacy,
      veracidad: form.veracidad,
    },
  }
  try {
    const v = await validateRegistro(body)
    if (!v.ok) {
      errors.value = v.errors || {}
      return
    }
    await registerV2(body)
    msg.value = 'Cuenta creada. Revisa tu email para verificar e inicia sesión.'
    setTimeout(() => router.replace('/login'), 1200)
  } catch (e) {
    if (e.data?.validation?.errors) errors.value = e.data.validation.errors
    else msg.value = e.message || 'No se pudo completar el registro'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: #061018;
  background-image: radial-gradient(ellipse 800px 400px at 10% 0%, rgba(34, 211, 238, 0.14), transparent 55%);
}
.auth-panel {
  width: min(640px, 100%);
  background: #0c1a24;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1.5rem;
  color: #e8f4f8;
}
.auth-panel.wide {
  width: min(720px, 100%);
}
.top {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}
.top a {
  color: #8aa8b8;
  margin-left: auto;
}
.brand {
  text-align: center;
  margin-bottom: 1.25rem;
}
.logo {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 0.75rem;
  display: grid;
  place-items: center;
  background: #22d3ee;
  color: #042028;
  border-radius: 10px;
}
.brand h1 {
  margin: 0;
  font-size: 1.25rem;
}
.brand p {
  margin: 0.4rem 0 0;
  color: #8aa8b8;
  font-size: 0.88rem;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem 1rem;
}
.grid label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.78rem;
  color: #8aa8b8;
}
.grid input {
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: #061018;
  color: #e8f4f8;
}
.consents {
  grid-column: 1 / -1;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.75rem 1rem;
}
.consents legend {
  color: #cfe8f0;
  font-size: 0.85rem;
}
.check {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin: 0.45rem 0;
  color: #cfe8f0;
  font-size: 0.82rem;
}
.err {
  grid-column: 1 / -1;
  color: #f87171;
  font-size: 0.85rem;
}
.ok {
  grid-column: 1 / -1;
  color: #34d399;
}
.btn-primary {
  grid-column: 1 / -1;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 9px;
  background: #22d3ee;
  color: #042028;
  font-weight: 700;
  cursor: pointer;
}
.btn-primary:disabled {
  opacity: 0.6;
}
.planes {
  margin-top: 1.25rem;
}
.planes h2 {
  font-size: 0.95rem;
  margin: 0 0 0.5rem;
}
.feats {
  color: #8aa8b8;
  font-size: 0.82rem;
}
.foot {
  margin-top: 1rem;
  color: #8aa8b8;
  font-size: 0.88rem;
}
.foot a {
  color: #22d3ee;
}
@media (max-width: 560px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
