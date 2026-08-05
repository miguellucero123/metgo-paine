<template>
  <div class="landing">
    <header>
      <nav aria-label="Principal">
        <a href="#inicio" class="brand">
          <span class="brand-icon" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#03222b" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18l5-9 4 6 2-3 7 6z"/><path d="M8 9l1.5-2.5L11 9"/></svg>
          </span>
          <span>
            <span class="brand-name">METGO</span>
            <span class="brand-sub">PAINE</span>
          </span>
        </a>
        <div class="nav-links">
          <a href="#circuitos">Circuitos</a>
          <a href="#servicios">Servicios</a>
          <a href="#funciona">Cómo funciona</a>
        </div>
        <div class="nav-cta">
          <router-link v-if="isLoggedIn" class="btn btn-primary" to="/app">Ir al panel</router-link>
          <template v-else>
            <router-link class="btn btn-ghost" to="/login">Iniciar sesión</router-link>
            <router-link class="btn btn-primary" to="/login?redirect=/app">Ver panel general</router-link>
          </template>
        </div>
      </nav>
    </header>

    <main>
      <section id="inicio" class="hero">
        <div class="wrap hero-grid">
          <div>
            <p class="eyebrow">Clima, nieve y criósfera · Torres del Paine</p>
            <h1>La Patagonia no <em>perdona</em> improvisar.</h1>
            <p class="hero-sub">
              Monitoreo hiperlocal de clima y criósfera para los circuitos W y O de Torres del Paine.
              Viento en pasos expuestos, temperatura y estado de nieve, punto por punto del sendero.
            </p>
            <div class="hero-actions">
              <router-link
                v-if="isLoggedIn"
                class="btn btn-primary btn-lg"
                to="/app"
              >
                Ver panel general
              </router-link>
              <router-link
                v-else
                class="btn btn-primary btn-lg"
                to="/login?redirect=/app"
              >
                Ver panel general
              </router-link>
              <a href="#circuitos" class="btn btn-ghost btn-lg">Ver circuitos</a>
            </div>
            <div class="hero-meta">
              <div><strong>6</strong>puntos de monitoreo</div>
              <div><strong>W · O</strong>circuitos cubiertos</div>
              <div><strong>°C / °F</strong>unidades configurables</div>
            </div>
          </div>

          <div class="card live-card">
            <div class="live-head">
              <span class="live-title">Condición destacada · Ahora</span>
              <span class="live-dot">
                <span class="pulse" aria-hidden="true" />
                {{ loading ? 'Cargando…' : 'En línea' }}
              </span>
            </div>
            <p class="live-location">{{ liveLocation }}</p>
            <p class="live-sub">{{ liveSub }}</p>

            <div class="stat-row">
              <div class="stat-cell">
                <div class="h">Temp.</div>
                <div class="t">{{ liveTemp }}</div>
              </div>
              <div class="stat-cell">
                <div class="h">Viento</div>
                <div class="t">{{ liveWind }}</div>
              </div>
              <div class="stat-cell">
                <div class="h">Precip.</div>
                <div class="t">{{ livePrecip }}</div>
              </div>
              <div class="stat-cell">
                <div class="h">Nieve</div>
                <div class="t">{{ liveSnow }}</div>
              </div>
            </div>

            <div v-if="liveAlert" class="live-alert" role="status">
              <span class="dot2" aria-hidden="true" />
              <p v-html="liveAlert" />
            </div>
            <p v-else-if="error" class="live-fallback">{{ error }}</p>
          </div>
        </div>
      </section>

      <div class="stats">
        <div class="wrap stats-grid">
          <div>
            <div class="stat-num"><span>6</span></div>
            <div class="stat-label">puntos de monitoreo en la red</div>
          </div>
          <div>
            <div class="stat-num"><span>2</span></div>
            <div class="stat-label">circuitos cubiertos: W y O</div>
          </div>
          <div>
            <div class="stat-num"><span>15</span> min</div>
            <div class="stat-label">frecuencia de actualización</div>
          </div>
          <div>
            <div class="stat-num"><span>&lt;5</span> min</div>
            <div class="stat-label">latencia de alerta de paso</div>
          </div>
        </div>
      </div>

      <section id="circuitos">
        <div class="wrap">
          <div class="section-head">
            <p class="section-eyebrow">Circuitos</p>
            <h2>Cada circuito, su propio riesgo</h2>
            <p class="section-desc">
              El W concentra los miradores más visitados; el O suma el paso de mayor exposición a viento de todo el parque.
            </p>
          </div>

          <div class="circ-grid">
            <div class="circ">
              <div class="circ-head">
                <span class="circ-badge badge-w">W</span>
                <div>
                  <h3>Circuito W</h3>
                  <div class="circ-days">4 lugares monitoreados · 4–5 días</div>
                </div>
              </div>
              <p>
                Recorrido corto que conecta Base Torres, Valle Francés y Glaciar Grey. Mayor afluencia de visitantes del parque.
              </p>
              <div class="circ-points">
                <span class="circ-pt">Base Torres</span>
                <span class="circ-pt">Valle Francés</span>
                <span class="circ-pt">Mirador Grey</span>
                <span class="circ-pt">Los Cuernos</span>
              </div>
            </div>

            <div class="circ">
              <div class="circ-head">
                <span class="circ-badge badge-o">O</span>
                <div>
                  <h3>Circuito O</h3>
                  <div class="circ-days">2 lugares adicionales · 7–9 días</div>
                </div>
              </div>
              <p>
                Rodea el macizo completo e incluye el paso John Gardner, tramo con las ráfagas más altas registradas del parque.
              </p>
              <div class="circ-points">
                <span class="circ-pt">Paso John Gardner</span>
                <span class="circ-pt">Refugio Los Perros</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicios">
        <div class="wrap">
          <div class="section-head">
            <p class="section-eyebrow">Qué monitorea el sistema</p>
            <h2>Datos pensados para el sendero</h2>
            <p class="section-desc">
              Cada módulo responde una pregunta que se hace un trekker o un guardaparque antes de avanzar.
            </p>
          </div>

          <div class="feat-grid">
            <div class="feat">
              <div class="feat-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 8h11a3 3 0 100-6M3 14h15a3 3 0 110 6M3 20h9"/></svg>
              </div>
              <h3>Viento por paso</h3>
              <p>Pronóstico horario de viento sostenido y ráfaga en los tramos más expuestos, como John Gardner.</p>
            </div>
            <div class="feat">
              <div class="feat-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2v6M12 16v6M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>
              </div>
              <h3>Estado de nieve</h3>
              <p>Cobertura y actividad de nieve por punto de monitoreo, clave para evaluar transitabilidad del sendero.</p>
            </div>
            <div class="feat">
              <div class="feat-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3c3 4 6 7 6 11a6 6 0 01-12 0c0-4 3-7 6-11z"/></svg>
              </div>
              <h3>Criósfera de glaciares</h3>
              <p>Seguimiento de condiciones sobre Glaciar Grey y su entorno inmediato, base de la identidad de METGO Paine.</p>
            </div>
            <div class="feat">
              <div class="feat-icon" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1.5z"/></svg>
              </div>
              <h3>Condición destacada</h3>
              <p>El sistema resalta automáticamente el punto de mayor riesgo del momento, sin revisar circuito por circuito.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="funciona">
        <div class="wrap">
          <div class="section-head">
            <p class="section-eyebrow">Cómo funciona</p>
            <h2>Del refugio a la decisión de avanzar</h2>
            <p class="section-desc">
              Cuatro pasos, desde el dato de la estación hasta la recomendación en el punto exacto del circuito.
            </p>
          </div>

          <div class="steps">
            <div class="step">
              <span class="step-num">01</span>
              <div>
                <h4>Lectura por punto</h4>
                <p>Los 6 puntos de monitoreo reportan temperatura, viento, precipitación y nieve cada 15 minutos.</p>
              </div>
            </div>
            <div class="step">
              <span class="step-num">02</span>
              <div>
                <h4>Cruce por circuito</h4>
                <p>Cada punto se asocia al circuito W u O y al tramo del sendero que representa.</p>
              </div>
            </div>
            <div class="step">
              <span class="step-num">03</span>
              <div>
                <h4>Condición destacada</h4>
                <p>El sistema identifica automáticamente el punto de mayor riesgo del momento en todo el parque.</p>
              </div>
            </div>
            <div class="step">
              <span class="step-num">04</span>
              <div>
                <h4>Recomendación</h4>
                <p>Se entrega una sugerencia clara: avanzar, esperar en refugio o reprogramar el tramo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cta">
        <div class="wrap">
          <div class="cta-band">
            <h2>Revise el paso antes de cruzarlo</h2>
            <p>Panel general en tiempo real para guías, guardaparques y trekkers de Torres del Paine.</p>
            <div class="cta-actions">
              <router-link
                v-if="isLoggedIn"
                class="btn btn-primary btn-lg"
                to="/app"
              >
                Ir al panel
              </router-link>
              <template v-else>
                <router-link class="btn btn-primary btn-lg" to="/login?redirect=/app">Iniciar sesión</router-link>
                <router-link class="btn btn-ghost btn-lg" to="/registro">Solicitar acceso</router-link>
              </template>
              <a href="#circuitos" class="btn btn-ghost btn-lg">Ver circuitos</a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer>
      <div class="wrap foot-row">
        <div class="foot-brand">
          <span class="brand-icon brand-icon--sm" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#03222b" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18l5-9 4 6 2-3 7 6z"/></svg>
          </span>
          METGO Paine · Torres del Paine, Patagonia chilena
        </div>
        <div class="foot-links">
          <a href="#circuitos">Circuitos</a>
          <a href="#funciona">Cómo funciona</a>
          <router-link to="/login">Iniciar sesión</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import {
  fetchEstacionesSitio,
  fetchPronosticoPublico,
  fetchResumenPublico,
  wakeApi,
} from '@/services/metgoApiService.js'

const store = useStore()
const isLoggedIn = computed(() => store.getters.isAuthenticated)

const loading = ref(true)
const error = ref('')
/** Payload unificado: resumen + probabilidad_lluvia del día 0 del pronóstico */
const meteo = ref(null)
const liveLocation = ref('Glaciar Grey')
const liveSub = ref('Circuito W · condición destacada')

const WIND_SAFE_KMH = 40

function num(...vals) {
  for (const v of vals) {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return null
}

/** API: precipitacion = mm; probabilidad_lluvia / pop = % */
function precipProb(row) {
  return num(row?.probabilidad_lluvia, row?.pop, row?.precipitacion_prob)
}

function windKmh(row) {
  return num(row?.viento, row?.viento_kmh, row?.wind_speed, row?.rafaga)
}

const liveTemp = computed(() => {
  const t = num(meteo.value?.temperatura, meteo.value?.temperatura_min)
  return t == null ? '—' : `${Math.round(t)}°C`
})

const liveWind = computed(() => {
  const w = windKmh(meteo.value)
  return w == null ? '—' : `${Math.round(w)} km/h`
})

const livePrecip = computed(() => {
  const p = precipProb(meteo.value)
  return p == null ? '—' : `${Math.round(p)}%`
})

const liveSnow = computed(() => {
  const tmin = num(meteo.value?.temperatura_min, meteo.value?.temperatura)
  const pop = precipProb(meteo.value)
  const mm = num(meteo.value?.precipitacion)
  if (meteo.value?.helada === true && (mm > 0 || (pop != null && pop >= 20))) return 'Activa'
  if (tmin != null && tmin <= 0 && ((mm != null && mm > 0) || (pop != null && pop >= 20))) {
    return 'Activa'
  }
  if (tmin != null && tmin > 2) return 'Inactiva'
  if (tmin != null && tmin <= 0) return 'Posible'
  return '—'
})

const liveAlert = computed(() => {
  const w = windKmh(meteo.value)
  if (w != null && w >= WIND_SAFE_KMH) {
    return '<strong>Viento sobre umbral de cruce seguro.</strong> Se recomienda esperar en refugio Los Perros antes de iniciar el ascenso al paso.'
  }
  const tmin = num(meteo.value?.temperatura_min, meteo.value?.temperatura)
  if (tmin != null && tmin <= 0) {
    return '<strong>Temperatura bajo 0 °C.</strong> Evalúe transitabilidad y exposición al viento antes de avanzar.'
  }
  if (meteo.value) {
    return '<strong>Condiciones dentro de rango operativo.</strong> Confirme el tramo en el panel antes de cruzar pasos expuestos.'
  }
  return ''
})

async function mergeResumenPronostico(estacionId) {
  const [resumen, pron] = await Promise.all([
    fetchResumenPublico(estacionId),
    fetchPronosticoPublico(estacionId, 2).catch(() => null),
  ])
  const day0 = Array.isArray(pron) ? pron[0] : null
  return {
    ...(resumen || {}),
    probabilidad_lluvia:
      precipProb(resumen) ?? precipProb(day0) ?? null,
    pop: precipProb(resumen) ?? precipProb(day0) ?? null,
    viento: windKmh(resumen) ?? windKmh(day0),
    temperatura: num(resumen?.temperatura) ?? num(day0?.temperatura),
    temperatura_min: num(resumen?.temperatura_min) ?? num(day0?.temperatura_min),
    temperatura_max: num(resumen?.temperatura_max) ?? num(day0?.temperatura_max),
    precipitacion: num(resumen?.precipitacion) ?? num(day0?.precipitacion),
    helada: resumen?.helada ?? day0?.helada,
  }
}

onMounted(async () => {
  wakeApi().catch(() => {})
  try {
    const est = await fetchEstacionesSitio()
    const list = Array.isArray(est) ? est : est?.estaciones || []
    if (!list.length) throw new Error('Sin estaciones paine')

    // Condición destacada = mayor viento entre puntos (GET /public/meteo/<id>)
    const samples = await Promise.all(
      list.map(async (e) => {
        const id = e.id || e.slug || e.estacion_id
        try {
          const row = await mergeResumenPronostico(id)
          return { est: e, id, row, wind: windKmh(row) ?? -1 }
        } catch {
          return { est: e, id, row: null, wind: -1 }
        }
      }),
    )
    samples.sort((a, b) => b.wind - a.wind)
    const best = samples.find((s) => s.row) || samples[0]
    if (!best?.row) throw new Error('Sin meteo')

    liveLocation.value = best.est.nombre || best.row.estacion || best.id
    const circ = best.est.circuito || ''
    liveSub.value = circ
      ? `Circuito ${circ} · mayor exposición a viento ahora`
      : 'Condición destacada · Torres del Paine'
    meteo.value = best.row
  } catch {
    error.value = 'Resumen temporalmente no disponible. El panel completo sigue tras iniciar sesión.'
    meteo.value = {
      temperatura: -5,
      temperatura_min: -5,
      viento: 54,
      probabilidad_lluvia: 20,
      precipitacion: 0.5,
      helada: true,
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.landing {
  --bg: #0b1120;
  --bg-glow:
    radial-gradient(ellipse 900px 520px at 12% -10%, rgba(34, 211, 238, 0.11), transparent 60%),
    radial-gradient(ellipse 700px 500px at 100% 15%, rgba(34, 211, 238, 0.06), transparent 55%);
  --surface: #131b2e;
  --surface-2: #0e1526;
  --border: rgba(255, 255, 255, 0.08);
  --border-accent: rgba(34, 211, 238, 0.3);
  --accent: #22d3ee;
  --accent-dim: rgba(34, 211, 238, 0.12);
  --amber: #f59e0b;
  --text: #f2f6fa;
  --muted: #92a0b5;
  --dim: #4c5872;
  --mono: 'SF Mono', 'Fira Code', 'JetBrains Mono', ui-monospace, monospace;
  --sans: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  min-height: 100vh;
  background: var(--bg);
  background-image: var(--bg-glow);
  background-attachment: fixed;
  color: var(--text);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
}
.landing :deep(a) {
  color: inherit;
  text-decoration: none;
}
.wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 28px;
}
.landing :deep(a:focus-visible),
.landing :deep(button:focus-visible) {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 4px;
}

header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(11, 17, 32, 0.85);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}
nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  max-width: 1120px;
  margin: 0 auto;
}
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
}
.brand-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(145deg, #67e8f5, #0ea5be);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(34, 211, 238, 0.32);
  flex-shrink: 0;
}
.brand-icon--sm {
  width: 24px;
  height: 24px;
  border-radius: 7px;
}
.brand-name {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.3px;
  display: block;
}
.brand-sub {
  font-size: 10px;
  color: var(--dim);
  font-family: var(--mono);
  letter-spacing: 1px;
  margin-top: 1px;
  display: block;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
}
.nav-links a {
  font-size: 13.5px;
  color: var(--muted);
  transition: color 0.15s;
}
.nav-links a:hover {
  color: var(--text);
}
.nav-cta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13.5px;
  font-weight: 600;
  padding: 9px 18px;
  border-radius: 9px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
  white-space: nowrap;
}
.btn-primary {
  background: var(--accent);
  color: #03222b;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(34, 211, 238, 0.3);
}
.btn-ghost {
  border-color: var(--border);
  color: var(--text);
}
.btn-ghost:hover {
  border-color: var(--border-accent);
  background: var(--accent-dim);
}
@media (max-width: 860px) {
  .nav-links {
    display: none;
  }
}

.hero {
  padding: 76px 0 64px;
}
.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 56px;
  align-items: center;
}
@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }
}
.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: var(--accent);
  font-family: var(--mono);
  margin-bottom: 22px;
}
.eyebrow::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}
h1 {
  font-size: 44px;
  font-weight: 800;
  line-height: 1.14;
  letter-spacing: -0.5px;
  margin-bottom: 20px;
}
h1 em {
  color: var(--accent);
  font-style: normal;
}
.hero-sub {
  font-size: 16px;
  color: var(--muted);
  line-height: 1.75;
  max-width: 490px;
  margin-bottom: 34px;
}
.hero-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}
.btn-lg {
  padding: 13px 24px;
  font-size: 14.5px;
  border-radius: 11px;
}
.hero-meta {
  display: flex;
  gap: 26px;
  flex-wrap: wrap;
}
.hero-meta div {
  font-size: 12px;
  color: var(--dim);
}
.hero-meta strong {
  display: block;
  color: var(--text);
  font-size: 13.5px;
  font-weight: 700;
  margin-bottom: 2px;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 22px;
}
.live-card {
  border-color: var(--border-accent);
  position: relative;
  overflow: hidden;
}
.live-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 100% 0%, rgba(34, 211, 238, 0.09), transparent 60%);
  pointer-events: none;
}
.live-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  position: relative;
}
.live-title {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--accent);
  font-family: var(--mono);
}
.live-dot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: var(--dim);
  font-family: var(--mono);
}
.pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.6);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.5);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(34, 211, 238, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(34, 211, 238, 0);
  }
}
.live-location {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 2px;
  position: relative;
}
.live-sub {
  font-size: 11.5px;
  color: var(--dim);
  margin-bottom: 18px;
  position: relative;
}
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;
  position: relative;
}
.stat-cell {
  background: var(--surface-2);
  border-radius: 9px;
  padding: 11px 8px;
  text-align: center;
}
.stat-cell .h {
  font-size: 8px;
  color: var(--dim);
  font-family: var(--mono);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.stat-cell .t {
  font-size: 14px;
  font-weight: 800;
  font-family: var(--mono);
  color: var(--text);
}
.live-alert {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  background: rgba(34, 211, 238, 0.08);
  border: 1px solid rgba(34, 211, 238, 0.24);
  border-radius: 10px;
  padding: 12px 14px;
  position: relative;
}
.live-alert .dot2 {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent);
  margin-top: 5px;
  flex-shrink: 0;
}
.live-alert p {
  font-size: 12.5px;
  color: #cbeaf2;
  line-height: 1.5;
  margin: 0;
}
.live-alert :deep(strong) {
  color: var(--accent);
}
.live-fallback {
  font-size: 12.5px;
  color: var(--muted);
  position: relative;
  margin: 0;
}

.stats {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 34px 0;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
@media (max-width: 700px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
.stat-num {
  font-size: 26px;
  font-weight: 800;
  font-family: var(--mono);
  color: var(--text);
  margin-bottom: 4px;
}
.stat-num span {
  color: var(--accent);
}
.stat-label {
  font-size: 12px;
  color: var(--muted);
}

section {
  padding: 84px 0;
}
.section-head {
  max-width: 560px;
  margin-bottom: 44px;
}
.section-eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  color: var(--accent);
  font-family: var(--mono);
  margin-bottom: 12px;
}
h2 {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.4px;
  margin-bottom: 12px;
}
.section-desc {
  font-size: 14.5px;
  color: var(--muted);
  line-height: 1.7;
}

.circ-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 760px) {
  .circ-grid {
    grid-template-columns: 1fr;
  }
}
.circ {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 26px;
}
.circ-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.circ-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  font-family: var(--mono);
  flex-shrink: 0;
}
.badge-w {
  background: var(--accent-dim);
  color: var(--accent);
  border: 1px solid var(--border-accent);
}
.badge-o {
  background: rgba(245, 158, 11, 0.13);
  color: var(--amber);
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.circ h3 {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
}
.circ-days {
  font-size: 11.5px;
  color: var(--dim);
  font-family: var(--mono);
}
.circ p {
  font-size: 13px;
  color: var(--muted);
  line-height: 1.65;
  margin-bottom: 16px;
}
.circ-points {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.circ-pt {
  font-size: 11px;
  color: var(--muted);
  background: var(--surface-2);
  border: 1px solid var(--border);
  padding: 5px 10px;
  border-radius: 20px;
}

.feat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
@media (max-width: 900px) {
  .feat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 560px) {
  .feat-grid {
    grid-template-columns: 1fr;
  }
}
.feat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 24px 20px;
  transition: border-color 0.2s, transform 0.2s;
}
.feat:hover {
  border-color: var(--border-accent);
  transform: translateY(-3px);
}
.feat-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: var(--accent-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: var(--accent);
}
.feat h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
}
.feat p {
  font-size: 12.5px;
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.step {
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 20px;
  padding: 22px 4px;
  border-bottom: 1px solid var(--border);
  align-items: flex-start;
}
.step:last-child {
  border-bottom: none;
}
.step-num {
  font-size: 22px;
  font-weight: 800;
  font-family: var(--mono);
  color: var(--border-accent);
}
.step h4 {
  font-size: 15.5px;
  font-weight: 700;
  margin-bottom: 5px;
}
.step p {
  font-size: 13px;
  color: var(--muted);
  max-width: 520px;
  line-height: 1.6;
  margin: 0;
}

.cta-band {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.1), rgba(34, 211, 238, 0.02));
  border: 1px solid var(--border-accent);
  border-radius: 20px;
  padding: 52px 40px;
  text-align: center;
}
.cta-band h2 {
  margin-bottom: 10px;
}
.cta-band p {
  color: var(--muted);
  font-size: 14.5px;
  margin-bottom: 26px;
}
.cta-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

footer {
  border-top: 1px solid var(--border);
  padding: 36px 0;
}
.foot-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.foot-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  color: var(--dim);
}
.foot-links {
  display: flex;
  gap: 22px;
}
.foot-links a {
  font-size: 12.5px;
  color: var(--dim);
}
.foot-links a:hover {
  color: var(--muted);
}

@media (max-width: 560px) {
  h1 {
    font-size: 32px;
  }
  .stat-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .cta-band {
    padding: 36px 20px;
  }
}
</style>
