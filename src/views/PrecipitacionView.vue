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

    <div class="card table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>Lugar</th>
            <th>Circuito</th>
            <th>Precip. hoy</th>
            <th>Viento</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filas" :key="row.id">
            <td>{{ row.nombre }}</td>
            <td>
              <span class="badge" :class="row.circuito === 'W' ? 'badge--neutral' : 'badge--warning'">
                {{ row.circuito }}
              </span>
            </td>
            <td>
              <div class="bar-cell">
                <div class="bar" :style="{ width: `${row.precip}%` }" />
                <span>{{ row.precip }}%</span>
              </div>
            </td>
            <td>{{ row.viento }} km/h</td>
            <td>
              <router-link :to="`/lugar/${row.id}`" class="btn btn-sm btn--ghost">Ver</router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { RefreshCw } from 'lucide-vue-next'

export default {
  name: 'PrecipitacionView',
  components: { RefreshCw },
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

.table-wrap {
  margin-top: var(--space-lg);
  overflow-x: auto;
  padding: 0;
}

.table-wrap .data-table {
  margin: 0;
}

.table-wrap th,
.table-wrap td {
  padding-left: 1rem;
  padding-right: 1rem;
}

.bar-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 140px;
}

.bar {
  height: 6px;
  max-width: 100px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  border-radius: 999px;
  box-shadow: var(--glow-primary);
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
