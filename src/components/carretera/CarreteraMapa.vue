<template>
  <div ref="mapEl" class="ca-map" role="application" aria-label="Mapa Carretera Austral"></div>
  <p v-if="mapError" class="ca-map-error" role="alert">{{ mapError }}</p>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Loader } from '@googlemaps/js-api-loader'
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
let polylines = []
let markers = []
let infoWindow = null

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

function clearOverlays() {
  polylines.forEach((p) => p.setMap(null))
  markers.forEach((m) => m.setMap(null))
  polylines = []
  markers = []
}

function drawTramos() {
  if (!map || !window.google?.maps) return
  clearOverlays()

  props.tramos.forEach((tramo) => {
    const path = [
      { lat: Number(tramo.lat_origen), lng: Number(tramo.lng_origen) },
      { lat: Number(tramo.lat_destino), lng: Number(tramo.lng_destino) },
    ]
    const selected = props.selectedId && String(props.selectedId) === String(tramo.id)
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: colorPorTipo(tramo.tipo_camino),
      strokeOpacity: selected ? 1 : 0.85,
      strokeWeight: selected ? 7 : 5,
      map,
      zIndex: selected ? 10 : 1,
    })
    polyline.addListener('click', (e) => {
      emit('select-tramo', tramo)
      if (infoWindow) {
        const pct =
          tramo.tipo_camino === 'mixto'
            ? ` · ${tramo.pct_pavimento}% pavimento`
            : ''
        infoWindow.setContent(`
          <div class="ca-iw">
            <strong>${tramo.origen} → ${tramo.destino}</strong><br/>
            ${tramo.distancia_km} km · ${tramo.tipo_camino}${pct}<br/>
            ${tramo.velocidad_kmh} km/h · ${Number(tramo.tiempo_hrs).toFixed(2)} h
          </div>
        `)
        infoWindow.setPosition(e.latLng)
        infoWindow.open(map)
      }
    })
    polylines.push(polyline)
  })

  props.localidades.forEach((loc) => {
    const marker = new google.maps.Marker({
      position: { lat: Number(loc.lat), lng: Number(loc.lng) },
      map,
      title: loc.nombre,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 5,
        fillColor: '#22d3ee',
        fillOpacity: 0.95,
        strokeColor: '#0e7490',
        strokeWeight: 1.5,
      },
    })
    marker.addListener('click', () => {
      if (infoWindow) {
        infoWindow.setContent(`<strong>${loc.nombre}</strong>`)
        infoWindow.open(map, marker)
      }
    })
    markers.push(marker)
  })
}

async function initMap() {
  if (!mapEl.value) return
  if (!apiKey) {
    mapError.value =
      'Falta VITE_GOOGLE_MAPS_API_KEY. Configúrala en .env o Cloudflare Pages; el panel lateral sigue activo con datos locales.'
    return
  }
  try {
    const loader = new Loader({
      apiKey,
      version: 'weekly',
    })
    await loader.load()
    map = new google.maps.Map(mapEl.value, {
      center: { lat: -45.0, lng: -72.2 },
      zoom: 6,
      mapTypeId: 'terrain',
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    })
    infoWindow = new google.maps.InfoWindow()
    drawTramos()
  } catch (e) {
    mapError.value = e?.message || 'No se pudo cargar Google Maps'
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
  map = null
})
</script>

<style scoped>
.ca-map {
  width: 100%;
  height: 100%;
  min-height: 320px;
  background: #0f172a;
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
