/**
 * Seed local Carretera Austral — fallback si no hay Supabase.
 * Coordenadas aproximadas; tipología pavimento / ripio / mixto.
 */

export const CA_LOCALIDADES = [
  { id: 'loc-pm', nombre: 'Puerto Montt', lat: -41.4719, lng: -72.9396 },
  { id: 'loc-ho', nombre: 'Hornopirén', lat: -41.9689, lng: -72.4466 },
  { id: 'loc-cg', nombre: 'Caleta Gonzalo', lat: -42.5185, lng: -72.6355 },
  { id: 'loc-ch', nombre: 'Chaitén', lat: -42.9167, lng: -72.7167 },
  { id: 'loc-vsl', nombre: 'Villa Santa Lucía', lat: -43.4092, lng: -72.3983 },
  { id: 'loc-fu', nombre: 'Futaleufú', lat: -43.185, lng: -71.8667 },
  { id: 'loc-pa', nombre: 'Palena', lat: -43.6167, lng: -71.8 },
  { id: 'loc-lj', nombre: 'La Junta', lat: -43.9667, lng: -72.4 },
  { id: 'loc-rm', nombre: 'Raúl Marín Balmaceda', lat: -44.05, lng: -72.55 },
  { id: 'loc-pu', nombre: 'Puyuhuapi', lat: -44.3167, lng: -72.5667 },
  { id: 'loc-lv', nombre: 'Lago Verde', lat: -44.2333, lng: -72.0 },
  { id: 'loc-pc', nombre: 'Puerto Cisnes', lat: -44.7333, lng: -72.7 },
  { id: 'loc-co', nombre: 'Coyhaique', lat: -45.5712, lng: -72.0685 },
  { id: 'loc-ay', nombre: 'Puerto Aysén', lat: -45.4, lng: -72.7 },
  { id: 'loc-ba', nombre: 'Balmaceda', lat: -45.914, lng: -71.716 },
  { id: 'loc-ib', nombre: 'Puerto Ibáñez', lat: -46.3, lng: -71.9333 },
  { id: 'loc-cc', nombre: 'Villa Cerro Castillo', lat: -46.0833, lng: -72.1833 },
  { id: 'loc-mu', nombre: 'Murta', lat: -46.4667, lng: -72.6667 },
  { id: 'loc-prt', nombre: 'Puerto Río Tranquilo', lat: -46.6167, lng: -72.6833 },
  { id: 'loc-pg', nombre: 'Puerto Guadal', lat: -46.4167, lng: -72.65 },
  { id: 'loc-chi', nombre: 'Chile Chico', lat: -46.5333, lng: -71.7333 },
  { id: 'loc-pb', nombre: 'Puerto Bertrand', lat: -46.9833, lng: -72.8333 },
  { id: 'loc-cr', nombre: 'Cochrane', lat: -47.25, lng: -72.5667 },
  { id: 'loc-ct', nombre: 'Caleta Tortel', lat: -47.7833, lng: -73.5333 },
  { id: 'loc-oh', nombre: "Villa O'Higgins", lat: -48.4667, lng: -72.5667 },
]

const byName = Object.fromEntries(CA_LOCALIDADES.map((l) => [l.nombre, l]))

function tramo(origen, destino, distancia_km, tipo_camino, pct_pavimento, velocidad_kmh, tiempo_hrs) {
  const a = byName[origen]
  const b = byName[destino]
  return {
    id: `tr-${origen}-${destino}`.replace(/\s+/g, '-').toLowerCase(),
    origen,
    destino,
    distancia_km,
    tipo_camino,
    pct_pavimento,
    velocidad_kmh,
    tiempo_hrs,
    lat_origen: a.lat,
    lng_origen: a.lng,
    lat_destino: b.lat,
    lng_destino: b.lng,
  }
}

export const CA_TRAMOS = [
  tramo('Puerto Montt', 'Hornopirén', 106, 'pavimento', 100, 50, 2.12),
  tramo('Caleta Gonzalo', 'Chaitén', 56, 'ripio', 0, 38, 1.47),
  tramo('Chaitén', 'Villa Santa Lucía', 75, 'pavimento', 100, 50, 1.5),
  tramo('Villa Santa Lucía', 'Futaleufú', 76, 'mixto', 20, 46, 1.65),
  tramo('Villa Santa Lucía', 'Palena', 71, 'mixto', 20, 46, 1.54),
  tramo('Villa Santa Lucía', 'La Junta', 69, 'pavimento', 100, 50, 1.38),
  tramo('La Junta', 'Raúl Marín Balmaceda', 74, 'ripio', 0, 38, 1.95),
  tramo('La Junta', 'Puyuhuapi', 45, 'pavimento', 100, 50, 0.9),
  tramo('La Junta', 'Lago Verde', 72, 'ripio', 0, 38, 1.89),
  tramo('Puyuhuapi', 'Puerto Cisnes', 87, 'mixto', 90, 49.5, 1.76),
  tramo('Puyuhuapi', 'Coyhaique', 233, 'mixto', 90, 49.5, 4.71),
  tramo('Puyuhuapi', 'Puerto Aysén', 205, 'mixto', 90, 49.5, 4.14),
  tramo('Puerto Aysén', 'Coyhaique', 64, 'pavimento', 100, 50, 1.28),
  tramo('Coyhaique', 'Balmaceda', 56, 'pavimento', 100, 50, 1.12),
  tramo('Coyhaique', 'Puerto Ibáñez', 115, 'pavimento', 100, 50, 2.3),
  tramo('Coyhaique', 'Villa Cerro Castillo', 96, 'pavimento', 100, 50, 1.92),
  tramo('Villa Cerro Castillo', 'Murta', 100, 'mixto', 10, 45, 2.22),
  tramo('Murta', 'Puerto Río Tranquilo', 23, 'ripio', 0, 38, 0.61),
  tramo('Puerto Río Tranquilo', 'Puerto Guadal', 59, 'ripio', 0, 38, 1.55),
  tramo('Puerto Guadal', 'Chile Chico', 105, 'mixto', 5, 42.5, 2.47),
  tramo('Puerto Río Tranquilo', 'Puerto Bertrand', 67, 'ripio', 0, 38, 1.76),
  tramo('Puerto Bertrand', 'Cochrane', 48, 'ripio', 0, 38, 1.26),
  tramo('Cochrane', 'Caleta Tortel', 126, 'ripio', 0, 38, 3.32),
  tramo('Caleta Tortel', "Villa O'Higgins", 151, 'ripio', 0, 38, 3.97),
  tramo('Cochrane', "Villa O'Higgins", 231, 'ripio', 0, 38, 6.08),
]

export const CA_COLORS = {
  pavimento: '#2ecc71',
  ripio: '#e74c3c',
  mixto: '#f39c12',
}

export function colorPorTipo(tipo) {
  const key = String(tipo || '').toLowerCase()
  return CA_COLORS[key] || '#95a5a6'
}

export function kmEquivPavimento(tramos) {
  return tramos.reduce((acc, t) => {
    const d = Number(t.distancia_km) || 0
    const pct = Number(t.pct_pavimento)
    if (t.tipo_camino === 'pavimento') return acc + d
    if (t.tipo_camino === 'mixto' && !Number.isNaN(pct)) return acc + (d * pct) / 100
    return acc
  }, 0)
}

export function kmEquivRipio(tramos) {
  return tramos.reduce((acc, t) => {
    const d = Number(t.distancia_km) || 0
    const pct = Number(t.pct_pavimento)
    if (t.tipo_camino === 'ripio') return acc + d
    if (t.tipo_camino === 'mixto' && !Number.isNaN(pct)) return acc + (d * (100 - pct)) / 100
    return acc
  }, 0)
}
