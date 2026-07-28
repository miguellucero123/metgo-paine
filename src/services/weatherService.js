/**
 * Clima del sitio: metgo-api → Open-Meteo → caché local.
 */

import site from '@/site.config.js'
import { lugares as staticLugares } from '@/data/lugares.js'
import {
  fetchEstacionesSitio,
  fetchPronosticoPublico,
  fetchResumenPublico,
  wakeApi,
  getApiBase,
} from '@/services/metgoApiService.js'

const CACHE_KEY = `${site.storagePrefix || 'metgo'}_weather_data_cache`
const LAST_UPDATE_KEY = `${site.storagePrefix || 'metgo'}_weather_last_update`
const SOURCE_KEY = `${site.storagePrefix || 'metgo'}_weather_data_source`

/** id numérico UI → slug API (desde site.config) */
const ID_TO_SLUG = Object.fromEntries(
  (site.stations || []).map((s) => [s.id, s.slug])
)

const wmoCodes = {
  0: { label: 'Soleado', icon: 'Sun' },
  1: { label: 'Soleado', icon: 'Sun' },
  2: { label: 'Parcialmente Nublado', icon: 'CloudSun' },
  3: { label: 'Nublado', icon: 'Cloud' },
  45: { label: 'Niebla', icon: 'CloudFog' },
  48: { label: 'Niebla', icon: 'CloudFog' },
  51: { label: 'Llovizna', icon: 'CloudDrizzle' },
  53: { label: 'Llovizna', icon: 'CloudDrizzle' },
  55: { label: 'Llovizna', icon: 'CloudDrizzle' },
  61: { label: 'Lluvioso', icon: 'CloudRain' },
  63: { label: 'Lluvioso', icon: 'CloudRain' },
  65: { label: 'Lluvioso', icon: 'CloudRain' },
  71: { label: 'Nieve', icon: 'Snowflake' },
  73: { label: 'Nieve', icon: 'Snowflake' },
  75: { label: 'Nieve', icon: 'Snowflake' },
  80: { label: 'Chubascos', icon: 'CloudRain' },
  95: { label: 'Tormenta', icon: 'CloudLightning' },
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

function diaDesdeFecha(fecha) {
  const d = String(fecha || '').slice(0, 10)
  if (d.length < 10) return d || '—'
  const date = new Date(`${d}T12:00:00`)
  return DAYS[date.getDay()] || d
}

function estadoDesdeResumen(r) {
  const p = Number(r?.precipitacion) || 0
  const tmin = Number(r?.temperatura_min)
  if (!Number.isNaN(tmin) && tmin <= 0) return 'Nieve'
  if (p >= 5) return 'Lluvioso'
  if (p >= 1) return 'Nublado'
  return 'Soleado'
}

export const weatherService = {
  shouldUpdate() {
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY)
    if (!lastUpdate) return true
    const lastDate = new Date(parseInt(lastUpdate, 10))
    const now = new Date()
    if (lastDate.getDate() !== now.getDate()) return true
    const currentHour = now.getHours()
    const lastHour = lastDate.getHours()
    if (currentHour >= 8 && lastHour < 8) return true
    if (currentHour >= 20 && lastHour < 20) return true
    return false
  },

  getLastUpdate() {
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY)
    return lastUpdate ? new Date(parseInt(lastUpdate, 10)) : null
  },

  getLastSource() {
    return localStorage.getItem(SOURCE_KEY) || null
  },

  async fetchAllWeather(forceUpdate = false) {
    let cachedData = null
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        cachedData = JSON.parse(cached)
      } catch {
        cachedData = null
      }
    }

    const needsCleanup = cachedData && JSON.stringify(cachedData).includes('Desconocido')
    if (!forceUpdate && !needsCleanup && !this.shouldUpdate() && cachedData) {
      return cachedData
    }

    // 1) metgo-api
    try {
      await wakeApi()
      const fromApi = await this.fetchFromMetgoApi()
      if (fromApi?.length) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(fromApi))
        localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString())
        localStorage.setItem(SOURCE_KEY, `metgo-api:${getApiBase()}`)
        return fromApi
      }
    } catch (e) {
      console.warn('metgo-api no disponible, fallback Open-Meteo:', e?.message || e)
    }

    // 2) Open-Meteo directo
    try {
      const fromOm = await this.fetchFromOpenMeteo()
      if (fromOm?.length) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(fromOm))
        localStorage.setItem(LAST_UPDATE_KEY, Date.now().toString())
        localStorage.setItem(SOURCE_KEY, 'open-meteo')
        return fromOm
      }
    } catch (e) {
      console.error('Open-Meteo error:', e)
    }

    // 3) Caché / estáticos
    if (cachedData) return cachedData
    return staticLugares.map((l) => ({ ...l }))
  },

  async fetchFromMetgoApi() {
    const estaciones = await fetchEstacionesSitio()
    if (!Array.isArray(estaciones) || !estaciones.length) {
      throw new Error(`Sin estaciones (${site.sitio})`)
    }
    const bySlug = Object.fromEntries(estaciones.map((e) => [e.id, e]))

    const updated = await Promise.all(
      staticLugares.map(async (lugar) => {
        const slug = ID_TO_SLUG[lugar.id]
        const est = bySlug[slug]
        if (!slug || !est) return { ...lugar }

        const [resumen, pron] = await Promise.all([
          fetchResumenPublico(slug).catch(() => null),
          fetchPronosticoPublico(slug, 7).catch(() => null),
        ])

        return this.transformFromApi(lugar, est, resumen, pron)
      })
    )
    return updated
  },

  transformFromApi(lugarBase, estacion, resumen, pronostico) {
    const rows = Array.isArray(pronostico) ? pronostico : []
    const pronosticoSemanal = rows.slice(0, 7).map((r) => ({
      dia: diaDesdeFecha(r.fecha),
      min: Math.round(Number(r.temperatura_min) || 0),
      max: Math.round(Number(r.temperatura_max) || 0),
      estado: estadoDesdeResumen(r),
      precipitacion: Math.round(Number(r.precipitacion) || 0),
      viento: Math.round(Number(r.viento) || 0),
    }))

    const temp =
      resumen?.temperatura ??
      resumen?.temperatura_max ??
      lugarBase.tempActual

    return {
      ...lugarBase,
      apiSlug: estacion.id,
      coordenadas: {
        lat: estacion.lat ?? lugarBase.coordenadas.lat,
        lon: estacion.lon ?? lugarBase.coordenadas.lon,
      },
      tempActual: Math.round(Number(temp) || 0),
      estadoActual: resumen ? estadoDesdeResumen(resumen) : lugarBase.estadoActual,
      fuente: resumen?.fuente || 'metgo-api',
      tipo_dato: resumen?.tipo_dato || 'pronostico',
      pronosticoSemanal: pronosticoSemanal.length
        ? pronosticoSemanal
        : lugarBase.pronosticoSemanal,
    }
  },

  async fetchFromOpenMeteo() {
    const updated = []
    for (const lugar of staticLugares) {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lugar.coordenadas.lat}` +
        `&longitude=${lugar.coordenadas.lon}` +
        `&current=temperature_2m,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max` +
        `&timezone=auto`
      const response = await fetch(url)
      if (response.status === 429) {
        throw new Error('Open-Meteo HTTP 429')
      }
      if (!response.ok) throw new Error(`Open-Meteo HTTP ${response.status}`)
      const data = await response.json()
      updated.push(this.transformData(lugar, data))
      // Evitar rate-limit al pedir muchos puntos seguidos (fallback sin API)
      await new Promise((r) => setTimeout(r, 350))
    }
    return updated
  },

  transformData(lugarBase, apiData) {
    const currentCode = apiData.current.weather_code
    const weatherInfo = wmoCodes[currentCode] || { label: 'Nublado', icon: 'Cloud' }

    const pronosticoSemanal = apiData.daily.time.map((time, index) => {
      const code = apiData.daily.weather_code[index]
      const info = wmoCodes[code] || { label: 'Nublado', icon: 'Cloud' }
      const date = new Date(`${time}T12:00:00`)
      return {
        dia: DAYS[date.getDay()],
        min: Math.round(apiData.daily.temperature_2m_min[index]),
        max: Math.round(apiData.daily.temperature_2m_max[index]),
        estado: info.label,
        precipitacion: apiData.daily.precipitation_probability_max[index],
        viento: Math.round(apiData.daily.wind_speed_10m_max[index]),
      }
    })

    return {
      ...lugarBase,
      apiSlug: ID_TO_SLUG[lugarBase.id],
      tempActual: Math.round(apiData.current.temperature_2m),
      estadoActual: weatherInfo.label,
      fuente: 'open-meteo',
      pronosticoSemanal,
    }
  },
}
