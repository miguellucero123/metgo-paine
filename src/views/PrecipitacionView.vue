<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Precipitación</h1>
      <p class="page-subtitle">
        Probabilidad de precipitación (día actual del pronóstico) · circuitos W y O
      </p>
      <div class="page-meta">
        <button type="button" class="btn btn-sm btn--ghost" :disabled="loading" @click="refresh">
          <RefreshCw :size="14" :class="{ spin: loading }" />
          Actualizar
        </button>
      </div>
    </header>

    <section class="card-grid">
      <div class="metric card">
        <div class="metric__label">Promedio parque</div>
        <div class="metric__value">{{ promedio }}%</div>
      </div>
      <div class="metric card">
        <div class="metric__label">Máximo</div>
        <div class="metric__value">{{ maximo.valor }}%</div>
        <div class="muted">{{ maximo.nombre }}</div>
      </div>
      <div class="metric card">
        <div class="metric__label">Mínimo</div>
        <div class="metric__value">{{ minimo.valor }}%</div>
        <div class="muted">{{ minimo.nombre }}</div>
      </div>
    </section>

    <section class="card chart-card">
      <h2 class="section-title">Ranking por lugar</h2>
      <HorizontalBarChart
        :labels="barLabels"
        :values="barValues"
        :station-ids="barIds"
        unit="%"
        kind="precip"
        clickable
        @bar-click="onBarClick"
      />
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { RefreshCw } from 'lucide-vue-next'
import HorizontalBarChart from '@components/charts/HorizontalBarChart.vue'

export default {
  name: 'PrecipitacionView',
  components: { RefreshCw, HorizontalBarChart },
  computed: {
    ...mapGetters(['weatherLugares', 'weatherLoading']),
    loading() {
      return this.weatherLoading
    },
    filas() {
      return (this.weatherLugares || [])
        .map((l) => {
          const d0 = l.pronosticoSemanal?.[0] || {}
          return {
            id: l.id,
            nombre: l.nombre,
            circuito: l.circuito,
            precip: Number(d0.precipitacion) || 0,
            viento: Number(d0.viento) || 0,
          }
        })
        .sort((a, b) => b.precip - a.precip)
    },
    barLabels() {
      return this.filas.map((r) => r.nombre)
    },
    barValues() {
      return this.filas.map((r) => r.precip)
    },
    barIds() {
      return this.filas.map((r) => r.id)
    },
    promedio() {
      if (!this.filas.length) return '—'
      return Math.round(this.filas.reduce((s, r) => s + r.precip, 0) / this.filas.length)
    },
    maximo() {
      const top = this.filas[0]
      return top ? { valor: top.precip, nombre: top.nombre } : { valor: '—', nombre: '' }
    },
    minimo() {
      const last = this.filas[this.filas.length - 1]
      return last ? { valor: last.precip, nombre: last.nombre } : { valor: '—', nombre: '' }
    },
  },
  methods: {
    ...mapActions(['fetchWeather']),
    refresh() {
      return this.fetchWeather(true)
    },
    onBarClick({ id }) {
      if (id != null) this.$router.push(`/lugar/${id}`)
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
  margin-top: 0.75rem;
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
  color: var(--color-primary);
  margin-top: 0.25rem;
}

.chart-card {
  margin-top: var(--space-lg);
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
