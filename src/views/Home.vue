<template>
  <div class="home-view">
    <div class="container">
      <header class="page-header">
        <h1 class="page-title">Meteorología</h1>
        <p class="page-subtitle">
          Condiciones actuales y pronóstico en puntos clave del parque — línea METGO Glaciares · Torres del Paine.
        </p>
        <div class="page-meta" v-if="lastUpdate">
          <span class="muted">
            <RefreshCw :size="14" :class="{ spin: loading }" />
            Última actualización: {{ formattedLastUpdate }}
          </span>
          <button type="button" class="btn btn-sm btn--ghost" :disabled="loading" @click="fetchWeather(true)">
            Actualizar
          </button>
        </div>
      </header>

      <div v-if="error" class="alert-banner" role="alert">
        No se pudieron actualizar los datos desde la API. Si hay datos en caché, se siguen mostrando.
        Puede reintentar con «Actualizar».
      </div>

      <section class="filters-section card">
        <div class="search-bar">
          <span class="search-icon"><Search :size="20" /></span>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar lugar por nombre, circuito o descripción..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="clear-btn"
            title="Limpiar búsqueda"
            @click="searchQuery = ''"
          >
            <X :size="16" />
          </button>
        </div>

        <div class="filter-buttons">
          <button
            type="button"
            :class="['filter-btn', { active: circuitoFiltro === 'Todos' }]"
            @click="circuitoFiltro = 'Todos'"
          >
            Todos
          </button>
          <button
            type="button"
            :class="['filter-btn', { active: circuitoFiltro === 'W' }]"
            @click="circuitoFiltro = 'W'"
          >
            Circuito W
          </button>
          <button
            type="button"
            :class="['filter-btn', { active: circuitoFiltro === 'O' }]"
            @click="circuitoFiltro = 'O'"
          >
            Circuito O
          </button>
        </div>

        <div class="sort-controls">
          <label class="sort-label">Ordenar por:</label>
          <select v-model="ordenamiento" class="sort-select">
            <option value="nombre">Nombre</option>
            <option value="temp-asc">Temperatura (menor a mayor)</option>
            <option value="temp-desc">Temperatura (mayor a menor)</option>
            <option value="dificultad">Dificultad</option>
          </select>
        </div>
      </section>

      <section class="stats-section" v-if="lugaresFiltrados.length > 0">
        <div class="stat-card card">
          <div class="stat-icon"><MapPin :size="28" class="text-primary" /></div>
          <div class="stat-value">{{ lugaresFiltrados.length }}</div>
          <div class="stat-label">Lugares</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon"><Thermometer :size="28" class="text-warning" /></div>
          <div class="stat-value">{{ temperaturaPromedio }}°{{ tempUnit }}</div>
          <div class="stat-label">Temp. promedio</div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon">
            <WeatherIcon :icon="estadoClimaPredominante.icono" :size="28" />
          </div>
          <div class="stat-value">{{ estadoClimaPredominante.nombre }}</div>
          <div class="stat-label">Estado predominante</div>
        </div>
      </section>

      <div v-if="lugaresFiltrados.length === 0" class="no-results card">
        <div class="no-results-icon"><Frown :size="48" /></div>
        <h3>No se encontraron lugares</h3>
        <p class="muted">Intenta con otro término de búsqueda o filtro</p>
        <button type="button" class="btn" @click="resetFilters">
          Restablecer filtros
        </button>
      </div>

      <!-- Grid de tarjetas de lugares -->
      <section v-else class="places-grid" :class="{ 'loading-opacity': loading }">
        <PlaceCard
          v-for="lugar in lugaresFiltrados"
          :key="lugar.id"
          :lugar="lugar"
          :temp-unit="tempUnit"
          :show-favorite="true"
        />
      </section>

      <!-- Loading Overlay -->
      <div v-if="loading && lugares.length === 0" class="loading-full glass-card">
        <div class="spinner"></div>
        <p>Cargando datos climáticos...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useWeather } from '@composables/useWeather.js';
import PlaceCard from '@components/PlaceCard.vue';
import WeatherIcon from '@components/WeatherIcon.vue';
import { Search, X, MapPin, Thermometer, Frown, RefreshCw } from 'lucide-vue-next';
import { 
  filtrarLugares, 
  ordenarPorTemperatura, 
  celsiusToFahrenheit,
  getWeatherIcon 
} from '@utils/helpers.js';

export default {
  name: 'Home',
  components: {
    PlaceCard,
    WeatherIcon,
    Search,
    X,
    MapPin,
    Thermometer,
    Frown,
    RefreshCw
  },
  props: {
    tempUnit: {
      type: String,
      default: 'C'
    }
  },
  setup() {
    const { lugares, fetchWeather, loading, error, lastUpdate } = useWeather();
    return { lugares, fetchWeather, loading, error, lastUpdate };
  },
  data() {
    return {
      searchQuery: '',
      circuitoFiltro: 'Todos',
      ordenamiento: 'nombre'
    };
  },
  mounted() {
    this.fetchWeather();
  },
  computed: {
    lugaresFiltrados() {
      let resultado = [...this.lugares];

      // Filtrar por búsqueda
      if (this.searchQuery.trim()) {
        resultado = filtrarLugares(resultado, this.searchQuery);
      }

      // Filtrar por circuito
      if (this.circuitoFiltro !== 'Todos') {
        resultado = resultado.filter(lugar => lugar.circuito === this.circuitoFiltro);
      }

      // Ordenar
      switch (this.ordenamiento) {
        case 'nombre':
          resultado.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
        case 'temp-asc':
          resultado = ordenarPorTemperatura(resultado, true);
          break;
        case 'temp-desc':
          resultado = ordenarPorTemperatura(resultado, false);
          break;
        case 'dificultad':
          const dificultadOrden = { 'Baja': 1, 'Baja-Media': 2, 'Media': 3, 'Media-Alta': 4, 'Alta': 5 };
          resultado.sort((a, b) => dificultadOrden[a.dificultad] - dificultadOrden[b.dificultad]);
          break;
      }

      return resultado;
    },
    temperaturaPromedio() {
      if (this.lugaresFiltrados.length === 0) return 0;
      const sum = this.lugaresFiltrados.reduce((acc, lugar) => acc + lugar.tempActual, 0);
      const promedio = sum / this.lugaresFiltrados.length;
      
      if (this.tempUnit === 'F') {
        return Math.round(celsiusToFahrenheit(promedio));
      }
      return Math.round(promedio);
    },
    estadoClimaPredominante() {
      if (this.lugaresFiltrados.length === 0) {
        return { nombre: '-', icono: '🌤️' };
      }

      const conteo = this.lugaresFiltrados.reduce((acc, lugar) => {
        acc[lugar.estadoActual] = (acc[lugar.estadoActual] || 0) + 1;
        return acc;
      }, {});

      const estadoMax = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])[0][0];

      return {
        nombre: estadoMax,
        icono: getWeatherIcon(estadoMax)
      };
    },
    formattedLastUpdate() {
      if (!this.lastUpdate) return '';
      return new Intl.DateTimeFormat('es-CL', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
      }).format(this.lastUpdate);
    }
  },
  methods: {
    resetFilters() {
      this.searchQuery = '';
      this.circuitoFiltro = 'Todos';
      this.ordenamiento = 'nombre';
    }
  }
};
</script>

<style scoped>
.home-view {
  max-width: 1280px;
  margin: 0 auto;
}

.container {
  width: 100%;
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
  gap: 0.4rem;
}

.filters-section {
  margin-bottom: var(--space-lg);
}

.search-bar {
  position: relative;
  margin-bottom: 1.25rem;
}

.search-icon {
  position: absolute;
  left: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-muted);
  display: flex;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.75rem 0.75rem 2.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.95rem;
  font-family: inherit;
  background: var(--color-bg);
  color: var(--color-text);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
}

.clear-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-surface-elevated);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted);
}

.clear-btn:hover {
  color: var(--color-primary);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.45rem 1rem;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  font-family: inherit;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.filter-btn:hover {
  border-color: var(--color-border-strong);
  color: var(--color-primary);
}

.filter-btn.active {
  background: var(--color-primary-muted);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-label {
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sort-select {
  flex: 1;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-family: inherit;
  background: var(--color-bg);
  color: var(--color-text);
  cursor: pointer;
}

.sort-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.stat-card {
  text-align: center;
  transition: border-color 0.15s, transform 0.15s;
}

.stat-card:hover {
  border-color: var(--color-border-strong);
  transform: translateY(-2px);
}

.stat-icon {
  margin-bottom: 0.35rem;
  display: flex;
  justify-content: center;
  color: var(--color-primary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.15rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.no-results {
  text-align: center;
  padding: 3rem 1.5rem;
}

.no-results-icon {
  margin-bottom: 0.75rem;
  color: var(--color-muted);
  display: flex;
  justify-content: center;
}

.no-results h3 {
  font-size: 1.15rem;
  margin-bottom: 0.35rem;
  color: var(--color-text);
}

.no-results .muted {
  margin-bottom: 1.25rem;
}

.places-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-md);
  transition: opacity 0.3s;
}

.loading-opacity {
  opacity: 0.5;
  pointer-events: none;
}

.loading-full {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--color-muted);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-left-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 768px) {
  .sort-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .places-grid {
    grid-template-columns: 1fr;
  }
}
</style>
