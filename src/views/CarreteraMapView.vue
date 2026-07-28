<template>
  <div class="ca-view">
    <aside class="ca-panel" aria-label="Panel Carretera Austral">
      <header class="ca-panel__head">
        <p class="ca-eyebrow">Rutas · Patagonia</p>
        <h1>Carretera Austral</h1>
        <p class="ca-lead">
          Tramos coloreados por tipo de camino. Mapa OpenStreetMap (Leaflet); datos locales o Supabase.
        </p>
      </header>

      <div class="ca-legend" role="list">
        <div class="ca-legend__item" role="listitem">
          <span class="swatch swatch--pav"></span> Pavimento
        </div>
        <div class="ca-legend__item" role="listitem">
          <span class="swatch swatch--rip"></span> Ripio
        </div>
        <div class="ca-legend__item" role="listitem">
          <span class="swatch swatch--mix"></span> Mixto
        </div>
      </div>

      <div class="ca-stats" aria-live="polite">
        <div class="ca-stat">
          <span class="ca-stat__label">Total</span>
          <span class="ca-stat__value">{{ stats.totalKm.toFixed(0) }} km</span>
        </div>
        <div class="ca-stat ca-stat--pav">
          <span class="ca-stat__label">Pavimento</span>
          <span class="ca-stat__value">{{ stats.pavimentoKm.toFixed(0) }} km</span>
        </div>
        <div class="ca-stat ca-stat--rip">
          <span class="ca-stat__label">Ripio</span>
          <span class="ca-stat__value">{{ stats.ripioKm.toFixed(0) }} km</span>
        </div>
        <div class="ca-stat ca-stat--mix">
          <span class="ca-stat__label">Mixto</span>
          <span class="ca-stat__value">{{ stats.mixtoKm.toFixed(0) }} km</span>
        </div>
        <div class="ca-stat ca-stat--wide">
          <span class="ca-stat__label">Equiv. pavimento / ripio</span>
          <span class="ca-stat__value">
            {{ stats.equivPavimento.toFixed(0) }} / {{ stats.equivRipio.toFixed(0) }} km
          </span>
        </div>
      </div>

      <div class="ca-filters" role="group" aria-label="Filtrar por tipo">
        <button
          v-for="f in filtros"
          :key="f.id"
          type="button"
          class="ca-chip"
          :class="{ 'ca-chip--on': filtroTipo === f.id }"
          @click="filtroTipo = f.id"
        >
          {{ f.label }}
        </button>
      </div>

      <p class="ca-meta">
        <span v-if="loading">Cargando…</span>
        <span v-else>{{ stats.count }} tramos · fuente {{ source }}</span>
        <span v-if="error" class="ca-meta--err"> · {{ error }}</span>
      </p>

      <ul class="ca-list">
        <li
          v-for="t in tramosFiltrados"
          :key="t.id"
          class="ca-list__item"
          :class="{ 'ca-list__item--on': selectedId === t.id }"
          @click="selectedId = t.id"
        >
          <span
            class="ca-dot"
            :style="{ background: colorPorTipo(t.tipo_camino) }"
            aria-hidden="true"
          ></span>
          <div class="ca-list__body">
            <strong>{{ t.origen }} → {{ t.destino }}</strong>
            <span>
              {{ t.distancia_km }} km · {{ t.tipo_camino
              }}<template v-if="t.tipo_camino === 'mixto'"> ({{ t.pct_pavimento }}%)</template>
            </span>
          </div>
        </li>
      </ul>
    </aside>

    <section class="ca-map-wrap">
      <CarreteraMapa
        :tramos="tramosFiltrados"
        :localidades="localidades"
        :selected-id="selectedId"
        @select-tramo="onSelectTramo"
      />
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CarreteraMapa from '@components/carretera/CarreteraMapa.vue'
import { useCarretera } from '@/composables/useCarretera.js'
import { colorPorTipo } from '@/data/carreteraAustral.js'

const {
  localidades,
  tramosFiltrados,
  loading,
  error,
  source,
  filtroTipo,
  stats,
} = useCarretera()

const selectedId = ref(null)

const filtros = [
  { id: 'todos', label: 'Todos' },
  { id: 'pavimento', label: 'Pavimento' },
  { id: 'ripio', label: 'Ripio' },
  { id: 'mixto', label: 'Mixto' },
]

function onSelectTramo(t) {
  selectedId.value = t?.id ?? null
}
</script>

<style scoped>
.ca-view {
  display: grid;
  grid-template-columns: minmax(280px, 360px) 1fr;
  height: calc(100vh - 64px);
  min-height: 480px;
  margin: -1rem;
  background:
    radial-gradient(ellipse 80% 50% at 10% 0%, rgba(34, 211, 238, 0.12), transparent 55%),
    var(--color-bg, #0b1220);
}

.ca-panel {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.25rem 1.1rem;
  overflow: auto;
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.82));
}

.ca-panel__head h1 {
  margin: 0.15rem 0 0.35rem;
  font-size: 1.55rem;
  letter-spacing: -0.02em;
  color: #f8fafc;
}

.ca-eyebrow {
  margin: 0;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-primary, #22d3ee);
}

.ca-lead {
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.45;
  color: #94a3b8;
}

.ca-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1rem;
  font-size: 0.8rem;
  color: #cbd5e1;
}

.ca-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.swatch {
  width: 14px;
  height: 4px;
  border-radius: 2px;
}
.swatch--pav {
  background: #2ecc71;
}
.swatch--rip {
  background: #e74c3c;
}
.swatch--mix {
  background: #f39c12;
}

.ca-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.ca-stat {
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.ca-stat--wide {
  grid-column: 1 / -1;
}

.ca-stat__label {
  display: block;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.ca-stat__value {
  font-size: 1rem;
  font-weight: 650;
  color: #f1f5f9;
}

.ca-stat--pav .ca-stat__value {
  color: #2ecc71;
}
.ca-stat--rip .ca-stat__value {
  color: #e74c3c;
}
.ca-stat--mix .ca-stat__value {
  color: #f39c12;
}

.ca-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ca-chip {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: transparent;
  color: #cbd5e1;
  border-radius: 999px;
  padding: 0.28rem 0.7rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.ca-chip--on {
  border-color: var(--color-primary, #22d3ee);
  color: #0f172a;
  background: var(--color-primary, #22d3ee);
}

.ca-meta {
  margin: 0;
  font-size: 0.72rem;
  color: #64748b;
}

.ca-meta--err {
  color: #f87171;
}

.ca-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ca-list__item {
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.55rem 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
}

.ca-list__item:hover,
.ca-list__item--on {
  background: rgba(34, 211, 238, 0.08);
  border-color: rgba(34, 211, 238, 0.25);
}

.ca-dot {
  width: 10px;
  height: 10px;
  margin-top: 0.35rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.ca-list__body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.ca-list__body strong {
  font-size: 0.82rem;
  color: #e2e8f0;
}

.ca-list__body span {
  font-size: 0.72rem;
  color: #94a3b8;
}

.ca-map-wrap {
  position: relative;
  min-height: 360px;
}

@media (max-width: 900px) {
  .ca-view {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(360px, 55vh);
    height: auto;
    margin: -0.5rem;
  }

  .ca-panel {
    max-height: 48vh;
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  }
}
</style>
