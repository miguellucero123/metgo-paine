<template>
  <div class="place-card-wrapper">
    <router-link :to="`/lugar/${lugar.id}`" class="place-card">
    <div class="card-header" :class="getWeatherClass(lugar.estadoActual)">
      <div class="place-icon">
        <WeatherIcon :icon="lugar.icono" :size="48" :stroke-width="1.5" />
      </div>
      <div class="weather-badge">
        <span class="weather-icon" :class="getWeatherIconColorClass(lugar.estadoActual)">
          <WeatherIcon :icon="getWeatherIcon(lugar.estadoActual)" :size="18" class="weather-icon-shadow" />
        </span>
        <span class="weather-text">{{ lugar.estadoActual }}</span>
      </div>
    </div>

    <div class="card-body">
      <h3 class="place-name">{{ lugar.nombre }}</h3>
      
      <p class="place-description">{{ lugar.descripcion }}</p>

      <div class="place-info">
        <div class="info-item">
          <span class="info-icon"><Target :size="16" /></span>
          <span class="info-label">Circuito:</span>
          <span class="info-value circuit-badge" :class="`circuit-${lugar.circuito}`">
            {{ lugar.circuito }}
          </span>
        </div>

        <div class="info-item">
          <span class="info-icon"><Mountain :size="16" /></span>
          <span class="info-label">Altitud:</span>
          <span class="info-value">{{ lugar.altitud }}m</span>
        </div>

        <div class="info-item">
          <span class="info-icon"><TrendingUp :size="16" /></span>
          <span class="info-label">Dificultad:</span>
          <span class="info-value difficulty-badge" :class="getDificultadClass(lugar.dificultad)">
            {{ lugar.dificultad }}
          </span>
        </div>
      </div>

      <div class="temperature-display">
        <div class="temp-current">
          <span class="temp-label">Actual</span>
          <span class="temp-value">{{ formatTemperature(lugar.tempActual) }}</span>
        </div>
        <div class="temp-range">
          <span class="temp-min">
            <span class="temp-icon"><ThermometerSnowflake :size="14" /></span>
            {{ formatTemperature(tempMinMax.min) }}
          </span>
          <span class="temp-separator">•</span>
          <span class="temp-max">
            <span class="temp-icon"><ThermometerSun :size="14" /></span>
            {{ formatTemperature(tempMinMax.max) }}
          </span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <span class="view-details">Ver pronóstico completo →</span>
    </div>
    </router-link>
    <button
      v-if="showFavorite && isAuthenticated"
      type="button"
      class="place-fav-btn"
      :class="{ active: favorited }"
      :title="favorited ? 'Quitar de favoritos' : 'Añadir a favoritos'"
      :aria-pressed="favorited"
      @click="onToggleFavorite"
    >
      <Heart :size="22" :fill="favorited ? 'currentColor' : 'none'" />
    </button>
  </div>
</template>

<script>
import { 
  getWeatherIcon, 
  getWeatherClass, 
  formatTemp, 
  celsiusToFahrenheit,
  getDificultadColor 
} from '@utils/helpers.js';
import WeatherIcon from './WeatherIcon.vue';
import { mapState, mapGetters, mapActions } from 'vuex';
import { Target, Mountain, TrendingUp, ThermometerSnowflake, ThermometerSun, Heart } from 'lucide-vue-next';

export default {
  name: 'PlaceCard',
  components: {
    WeatherIcon,
    Target,
    Mountain,
    TrendingUp,
    ThermometerSnowflake,
    ThermometerSun,
    Heart
  },
  props: {
    lugar: {
      type: Object,
      required: true
    },
    tempUnit: {
      type: String,
      default: 'C'
    },
    showFavorite: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState({
      isAuthenticated: (s) => !!s.user
    }),
    ...mapGetters(['isFavorite']),
    favorited() {
      return this.isFavorite(this.lugar.id);
    },
    tempMinMax() {
      if (!this.lugar.pronosticoSemanal || this.lugar.pronosticoSemanal.length === 0) {
        return { min: 0, max: 0 };
      }

      const temperaturas = this.lugar.pronosticoSemanal.flatMap(dia => [dia.min, dia.max]);
      return {
        min: Math.min(...temperaturas),
        max: Math.max(...temperaturas)
      };
    }
  },
  methods: {
    ...mapActions(['toggleFavorite']),
    onToggleFavorite(e) {
      e.preventDefault();
      e.stopPropagation();
      this.toggleFavorite(this.lugar.id);
    },
    getWeatherIcon,
    getWeatherClass,
    getDificultadClass(dificultad) {
      return `difficulty-${getDificultadColor(dificultad)}`;
    },
    formatTemperature(temp) {
      if (this.tempUnit === 'F') {
        return formatTemp(celsiusToFahrenheit(temp), 'F');
      }
      return formatTemp(temp, 'C');
    },
    getWeatherIconColorClass(estado) {
      if (estado.includes('Nieve')) return 'text-snow';
      if (estado.includes('Tormenta')) return 'text-storm';
      if (estado.includes('Lluvia') || estado.includes('Lluvioso') || estado.includes('Chubascos')) return 'text-rain';
      if (estado.includes('Soleado')) return 'text-sun';
      return '';
    }
  }
};
</script>

<style scoped>
.place-card-wrapper {
  position: relative;
}

.place-fav-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 2;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.place-fav-btn:hover {
  color: var(--color-danger);
  border-color: var(--color-border-strong);
}

.place-fav-btn.active {
  color: var(--color-danger);
  background: var(--color-danger-bg);
}

.place-card {
  display: block;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.place-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-strong);
  box-shadow: var(--glow-primary);
}

.card-header {
  position: relative;
  padding: 1.25rem 1.25rem 0.85rem;
  background: linear-gradient(135deg, #0b1120 0%, #111827 55%, #1f2937 100%);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-header.sunny {
  background: linear-gradient(135deg, #0b1120 0%, rgba(245, 158, 11, 0.25) 100%);
}

.card-header.cloudy {
  background: linear-gradient(135deg, #0b1120 0%, rgba(14, 165, 233, 0.25) 100%);
}

.card-header.rainy {
  background: linear-gradient(135deg, #0b1120 0%, rgba(16, 185, 129, 0.25) 100%);
}

.card-header.snowy {
  background: linear-gradient(135deg, #0b1120 0%, rgba(56, 189, 248, 0.28) 100%);
}

.card-header.storm {
  background: linear-gradient(135deg, #0b1120 0%, rgba(34, 211, 238, 0.18) 100%);
}

.place-icon {
  color: var(--color-primary);
  filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.35));
}

.weather-badge {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.weather-text {
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--color-text);
}

.weather-icon.text-snow {
  color: var(--color-accent-light);
}

.card-body {
  padding: 1.25rem;
}

.place-name {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.place-description {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.place-info {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
}

.info-icon {
  color: var(--color-primary);
  display: flex;
}

.info-label {
  color: var(--color-muted);
  font-weight: 500;
}

.info-value {
  font-weight: 600;
  color: var(--color-text);
}

.circuit-badge,
.difficulty-badge {
  padding: 0.15rem 0.55rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.circuit-W {
  background: var(--color-info-bg);
  color: var(--color-accent-light);
}

.circuit-O {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.difficulty-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.difficulty-info {
  background: var(--color-info-bg);
  color: var(--color-accent-light);
}

.difficulty-warning,
.difficulty-orange {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.difficulty-danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.temperature-display {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.temp-current {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.temp-label {
  font-size: 0.65rem;
  color: var(--color-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.15rem;
}

.temp-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
}

.temp-range {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.temp-min {
  color: var(--color-accent-light);
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.temp-max {
  color: var(--color-warning);
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.temp-separator {
  color: var(--color-muted);
}

.card-footer {
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: center;
  background: var(--color-primary-subtle);
}

.view-details {
  font-weight: 600;
  color: var(--color-primary);
  font-size: 0.8rem;
  transition: transform 0.15s ease;
  display: inline-block;
}

.place-card:hover .view-details {
  transform: translateX(4px);
}
</style>
