<template>
  <div ref="mapEl" class="ca-map" role="application" aria-label="Mapa Carretera Austral"></div>
  <p v-if="mapError" class="ca-map-error" role="alert">{{ mapError }}</p>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { colorPorTipo } from '@/data/carreteraAustral.js'

const props = defineProps({
  tramos: { type: Array, default: () => [] },
  localidades: { type: Array, default: () => [] },
  selectedId: { type: [String, null], default: null },
})

const emit = defineEmits(['select-tramo'])

const mapEl = ref(null)
const mapError = ref('')
let map = null
let layerGroup = null

function clearOverlays() {
  if (layerGroup) {
    layerGroup.clearLayers()
  }
}

function popupTramo(tramo) {
  const pct =
    tramo.tipo_camino === 'mixto' ? ` · ${tramo.pct_pavimento}% pavimento` : ''
  return `
    <div class="ca-iw">
      <strong>${tramo.origen} → ${tramo.destino}</strong><br/>
      ${tramo.distancia_km} km · ${tramo.tipo_camino}${pct}<br/>
      ${tramo.velocidad_kmh} km/h · ${Number(tramo.tiempo_hrs).toFixed(2)} h
    </div>
  `
}

function drawTramos() {
  if (!map || !layerGroup) return
  clearOverlays()

  props.tramos.forEach((tramo) => {
    const latlngs = [
      [Number(tramo.lat_origen), Number(tramo.lng_origen)],
      [Number(tramo.lat_destino), Number(tramo.lng_destino)],
    ]
    const selected = props.selectedId && String(props.selectedId) === String(tramo.id)
    const line = L.polyline(latlngs, {
      color: colorPorTipo(tramo.tipo_camino),
      weight: selected ? 7 : 5,
      opacity: selected ? 1 : 0.85,
    })
    line.bindPopup(popupTramo(tramo))
    line.on('click', () => emit('select-tramo', tramo))
    layerGroup.addLayer(line)
  })

  props.localidades.forEach((loc) => {
    const marker = L.circleMarker([Number(loc.lat), Number(loc.lng)], {
      radius: 6,
      color: '#0e7490',
      weight: 1.5,
      fillColor: '#22d3ee',
      fillOpacity: 0.95,
    })
    marker.bindPopup(`<strong>${loc.nombre}</strong>`)
    marker.bindTooltip(loc.nombre, { direction: 'top', offset: [0, -6] })
    layerGroup.addLayer(marker)
  })
}

function initMap() {
  if (!mapEl.value || map) return
  try {
    map = L.map(mapEl.value, {
      center: [-45.0, -72.2],
      zoom: 6,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    layerGroup = L.layerGroup().addTo(map)
    drawTramos()

    // Leaflet needs a resize after layout settles in flex/grid containers
    requestAnimationFrame(() => {
      map?.invalidateSize()
    })
    setTimeout(() => map?.invalidateSize(), 200)
  } catch (e) {
    mapError.value = e?.message || 'No se pudo cargar el mapa'
  }
}

watch(
  () => [props.tramos, props.localidades, props.selectedId],
  () => {
    if (map) drawTramos()
  },
  { deep: true }
)

onMounted(() => {
  initMap()
})

onUnmounted(() => {
  clearOverlays()
  if (map) {
    map.remove()
    map = null
  }
  layerGroup = null
})
</script>

<style scoped>
.ca-map {
  width: 100%;
  height: 100%;
  min-height: 320px;
  background: #0f172a;
  z-index: 0;
}

.ca-map :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  background: #0f172a;
  font-family: inherit;
}

.ca-map :deep(.leaflet-popup-content-wrapper) {
  background: #111827;
  color: #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

.ca-map :deep(.leaflet-popup-tip) {
  background: #111827;
}

.ca-map :deep(.leaflet-popup-content) {
  margin: 0.65rem 0.85rem;
  font-size: 0.85rem;
  line-height: 1.4;
}

.ca-map-error {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  margin: 0;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(34, 211, 238, 0.35);
  color: #e2e8f0;
  font-size: 0.85rem;
  z-index: 2;
  pointer-events: none;
}
</style>
