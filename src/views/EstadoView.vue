<template>
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Estado del sistema</h1>
      <p class="page-subtitle">
        Salud de datos y cliente · METGO Paine ↔ metgo-api
      </p>
      <div class="page-meta">
        <button type="button" class="btn btn-sm btn--ghost" @click="refresh">
          <RefreshCw :size="14" :class="{ spin: loading }" />
          Comprobar
        </button>
      </div>
    </header>

    <div class="card-grid">
      <div v-for="t in tarjetas" :key="t.titulo" class="card status-card">
        <div class="status-card__head">
          <component :is="t.icon" class="status-card__icon" aria-hidden="true" />
          <span class="badge" :class="`badge--${t.badge}`">{{ t.estadoLabel }}</span>
        </div>
        <h3 class="status-card__title">{{ t.titulo }}</h3>
        <p class="muted">{{ t.detalle }}</p>
      </div>
    </div>

    <section class="card info-block">
      <h2 class="section-title">Identidad del sitio</h2>
      <ul class="info-list">
        <li><strong>Producto:</strong> METGO Paine · línea Glaciares</li>
        <li><strong>Región:</strong> Torres del Paine, Magallanes, Chile</li>
        <li><strong>Fuente clima:</strong> metgo-api (sitio=paine) → Open-Meteo → caché</li>
        <li><strong>Hermanado con:</strong> METGO Quillota (Valle de Aconcagua) — acento verde</li>
      </ul>
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { Activity, Cloud, Globe, Clock, Database, RefreshCw } from 'lucide-vue-next'

export default {
  name: 'EstadoView',
  components: { RefreshCw },
  data() {
    return {
      browserOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      checkedAt: new Date(),
    }
  },
  computed: {
    ...mapGetters([
      'weatherLugares',
      'weatherLoading',
      'weatherError',
      'weatherLastUpdate',
    ]),
    loading() {
      return this.weatherLoading
    },
    tarjetas() {
      const online = this.browserOnline
      const err = !!this.weatherError
      const n = this.weatherLugares?.length || 0
      const upd = this.weatherLastUpdate
        ? new Date(this.weatherLastUpdate).toLocaleString('es-CL')
        : 'Sin sync aún'

      return [
        {
          titulo: 'Navegador',
          icon: Globe,
          estadoLabel: online ? 'En línea' : 'Offline',
          badge: online ? 'success' : 'danger',
          detalle: online ? 'Conexión disponible' : 'Sin red — use caché local',
        },
        {
          titulo: 'Open-Meteo',
          icon: Cloud,
          estadoLabel: err ? 'Degradado' : n ? 'OK' : 'Pendiente',
          badge: err ? 'warning' : n ? 'success' : 'neutral',
          detalle: err
            ? 'Error al consultar API; posible caché'
            : `Datos para ${n} puntos TDP`,
        },
        {
          titulo: 'Fuente activa',
          icon: Database,
          estadoLabel: this.dataSource?.startsWith('metgo-api') ? 'metgo-api' : (this.dataSource || '—'),
          badge: this.dataSource?.startsWith('metgo-api') ? 'success' : 'neutral',
          detalle: this.dataSource || 'Sin sync aún',
        },
        {
          titulo: 'Catálogo lugares',
          icon: Database,
          estadoLabel: n >= 1 ? 'Cargado' : 'Vacío',
          badge: n >= 1 ? 'success' : 'warning',
          detalle: `${n} estaciones / miradores en memoria`,
        },
        {
          titulo: 'Última sync clima',
          icon: Clock,
          estadoLabel: 'Info',
          badge: 'neutral',
          detalle: upd,
        },
        {
          titulo: 'Cliente SPA',
          icon: Activity,
          estadoLabel: 'Activo',
          badge: 'success',
          detalle: `Comprobado ${this.checkedAt.toLocaleTimeString('es-CL')}`,
        },
      ]
    },
    dataSource() {
      try {
        return localStorage.getItem('weather_data_source') || ''
      } catch {
        return ''
      }
    },
  },
  methods: {
    ...mapActions(['fetchWeather']),
    onOnline() {
      this.browserOnline = true
    },
    onOffline() {
      this.browserOnline = false
    },
    async refresh() {
      this.checkedAt = new Date()
      this.browserOnline = navigator.onLine
      await this.fetchWeather(true)
    },
  },
  mounted() {
    window.addEventListener('online', this.onOnline)
    window.addEventListener('offline', this.onOffline)
    this.fetchWeather()
  },
  beforeUnmount() {
    window.removeEventListener('online', this.onOnline)
    window.removeEventListener('offline', this.onOffline)
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

.status-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
}

.status-card__icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-primary);
}

.status-card__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

.info-block {
  margin-top: var(--space-lg);
}

.section-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.85rem;
}

.info-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.info-list strong {
  color: var(--color-text);
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
