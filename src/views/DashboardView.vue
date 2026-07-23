<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Panel general</h1>
      <p class="page-subtitle">
        Resumen criósfera · Torres del Paine · Circuitos W y O
      </p>
      <div class="page-meta">
        <span class="muted" v-if="lastUpdate">
          Actualizado: {{ formattedUpdate }}
        </span>
        <button type="button" class="btn btn-sm btn--ghost" :disabled="loading" @click="refresh">
          <RefreshCw :size="14" :class="{ spin: loading }" />
          Actualizar
        </button>
      </div>
    </header>

    <div v-if="error" class="alert-banner" role="alert">
      No se pudo actualizar Open-Meteo. Se muestran datos en caché o estáticos.
    </div>

    <section class="card-grid">
      <div class="metric card">
        <div class="metric__icon"><MapPin :size="22" /></div>
        <div class="metric__label">Puntos de monitoreo</div>
        <div class="metric__value">{{ lugares.length }}</div>
      </div>
      <div class="metric card">
        <div class="metric__icon"><Thermometer :size="22" /></div>
        <div class="metric__label">Temp. promedio</div>
        <div class="metric__value">{{ tempPromedio }}°{{ tempUnit }}</div>
      </div>
      <div class="metric card">
        <div class="metric__icon"><CloudRain :size="22" /></div>
        <div class="metric__label">Precip. media (hoy)</div>
        <div class="metric__value">{{ precipMedia }}%</div>
      </div>
      <div class="metric card">
        <div class="metric__icon"><Wind :size="22" /></div>
        <div class="metric__label">Viento medio</div>
        <div class="metric__value">{{ vientoMedio }} km/h</div>
      </div>
    </section>

    <section class="layout-split">
      <div class="card">
        <h2 class="section-title">Circuitos</h2>
        <div class="circuit-row">
          <div class="circuit-pill">
            <span class="badge badge--neutral">W</span>
            <strong>{{ countW }}</strong>
            <span class="muted">lugares</span>
          </div>
          <div class="circuit-pill">
            <span class="badge badge--warning">O</span>
            <strong>{{ countO }}</strong>
            <span class="muted">lugares</span>
          </div>
        </div>
        <p class="muted hint-text">
          Identidad METGO Paine: monitoreo hiperlocal de glaciares y trekking en Patagonia.
        </p>
        <router-link to="/meteo" class="btn btn-sm">Ver meteorología</router-link>
      </div>

      <div class="card">
        <h2 class="section-title">Condición destacada</h2>
        <div v-if="destacado" class="featured">
          <h3>{{ destacado.nombre }}</h3>
          <p class="muted">{{ destacado.descripcion }}</p>
          <div class="featured-stats">
            <span class="badge badge--neutral">{{ destacado.estadoActual }}</span>
            <span class="temp">{{ formatTemp(destacado.tempActual) }}</span>
          </div>
          <router-link :to="`/lugar/${destacado.id}`" class="btn btn-sm btn--ghost">
            Ver detalle
          </router-link>
        </div>
        <p v-else class="muted">Cargando lugares…</p>
      </div>
    </section>

    <section class="card quick-links">
      <h2 class="section-title">Accesos rápidos</h2>
      <p v-if="dataSource" class="muted source-line">Fuente datos: {{ dataSource }}</p>
      <div class="links">
        <router-link to="/meteo" class="link-chip">Meteorología</router-link>
        <router-link to="/meteo/precipitacion" class="link-chip">Precipitación</router-link>
        <router-link to="/estado" class="link-chip">Estado sistema</router-link>
      </div>
    </section>

    <section v-if="destacado && comboLabels.length" class="card combo-section">
      <h2 class="section-title">Pronóstico 7 días · {{ destacado.nombre }}</h2>
      <ComboMeteoChart
        :labels="comboLabels"
        :temperaturas="comboTemps"
        :precipitacion="comboPrecip"
        :temp-unit="`°${tempUnit}`"
        export-name="combo_paine"
      />
    </section>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import { MapPin, Thermometer, CloudRain, Wind, RefreshCw } from 'lucide-vue-next'
import { celsiusToFahrenheit } from '@utils/helpers.js'
import ComboMeteoChart from '@components/charts/ComboMeteoChart.vue'

export default {
  name: 'DashboardView',
  components: { MapPin, Thermometer, CloudRain, Wind, RefreshCw, ComboMeteoChart },
  computed: {
    ...mapState(['preferences']),
    ...mapGetters(['weatherLugares', 'weatherLoading', 'weatherError', 'weatherLastUpdate']),
    lugares() {
      return this.weatherLugares || []
    },
    loading() {
      return this.weatherLoading
    },
    error() {
      return this.weatherError
    },
    lastUpdate() {
      return this.weatherLastUpdate
    },
    tempUnit() {
      return this.preferences?.tempUnit || 'C'
    },
    formattedUpdate() {
      if (!this.lastUpdate) return '—'
      const d = this.lastUpdate instanceof Date ? this.lastUpdate : new Date(this.lastUpdate)
      return d.toLocaleString('es-CL')
    },
    tempPromedio() {
      if (!this.lugares.length) return '—'
      const avg =
        this.lugares.reduce((s, l) => s + (Number(l.tempActual) || 0), 0) / this.lugares.length
      return this.formatTempNum(avg)
    },
    precipMedia() {
      const vals = this.lugares
        .map((l) => l.pronosticoSemanal?.[0]?.precipitacion)
        .filter((v) => v != null)
      if (!vals.length) return '—'
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    },
    vientoMedio() {
      const vals = this.lugares
        .map((l) => l.pronosticoSemanal?.[0]?.viento)
        .filter((v) => v != null)
      if (!vals.length) return '—'
      return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
    },
    countW() {
      return this.lugares.filter((l) => l.circuito === 'W').length
    },
    countO() {
      return this.lugares.filter((l) => l.circuito === 'O').length
    },
    destacado() {
      return this.lugares.find((l) => l.nombre?.includes('Torres')) || this.lugares[0] || null
    },
    dataSource() {
      try {
        return localStorage.getItem('weather_data_source') || '—'
      } catch {
        return '—'
      }
    },
    comboLabels() {
      return (this.destacado?.pronosticoSemanal || []).map((d) => d.dia)
    },
    comboTemps() {
      return (this.destacado?.pronosticoSemanal || []).map((d) =>
        this.tempUnit === 'F' ? Math.round(celsiusToFahrenheit(d.max)) : d.max
      )
    },
    comboPrecip() {
      // Open-Meteo probability % → approx mm visual (keep as %)
      return (this.destacado?.pronosticoSemanal || []).map((d) => Number(d.precipitacion) || 0)
    },
  },
  methods: {
    ...mapActions(['fetchWeather']),
    refresh() {
      return this.fetchWeather(true)
    },
    formatTempNum(c) {
      const n = this.tempUnit === 'F' ? celsiusToFahrenheit(c) : c
      return Math.round(n)
    },
    formatTemp(c) {
      return `${this.formatTempNum(c)}°${this.tempUnit}`
    },
  },
  mounted() {
    this.fetchWeather()
  },
}
</script>

<style scoped>
.page {
  max-width: 1280px;
  margin: 0 auto;
}

.page-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.page-meta .muted {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.metric {
  text-align: left;
}

.metric__icon {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.metric__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-muted);
  font-weight: 600;
}

.metric__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-top: 0.25rem;
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text);
}

.circuit-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.circuit-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.hint-text {
  margin-bottom: 1rem;
  font-size: 0.85rem;
  line-height: 1.45;
}

.featured h3 {
  font-size: 1.15rem;
  margin-bottom: 0.35rem;
}

.featured-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.85rem 0;
}

.temp {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.quick-links {
  margin-top: var(--space-lg);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.link-chip {
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.link-chip:hover {
  background: var(--color-primary-muted);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.source-line {
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
}

.combo-section {
  margin-top: var(--space-lg);
}
</style>
