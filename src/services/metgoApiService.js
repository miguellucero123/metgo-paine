/**
 * Cliente público metgo-api (sitio desde site.config.js).
 * Sin JWT — endpoints /api/public/*
 *
 * Contrato GET relevante (Paine):
 * - GET /public/estaciones?sitio=paine → Array[{id,slug,nombre,circuito,lat,lon,…}]
 * - GET /public/meteo/:id → {temperatura,temperatura_min/max,viento km/h,
 *     precipitacion mm, probabilidad_lluvia? %, helada?, fuente,…}
 * - GET /public/meteo/:id/pronostico?dias=N → Array días (incluye probabilidad_lluvia)
 * - GET /public/planes?sitio=paine → {planes:[…]}
 * - GET /health → wake Render
 */
import site from '@/site.config.js'
import { resolveMetgoApiBase } from '@/utils/resolveMetgoApiBase.js'

const SITIO = site.sitio
const TIMEOUT_MS = 45000

function resolveBaseURL() {
  return resolveMetgoApiBase()
}

async function fetchJson(path, { timeout = TIMEOUT_MS } = {}) {
  const base = resolveBaseURL()
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(`${base}${path}`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      const err = new Error(`HTTP ${res.status}`)
      err.status = res.status
      throw err
    }
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

/** Wake Render free (best-effort). */
export async function wakeApi() {
  try {
    await fetchJson('/health', { timeout: 20000 })
    return true
  } catch {
    return false
  }
}

export async function fetchEstacionesSitio() {
  return fetchJson(`/public/estaciones?sitio=${encodeURIComponent(SITIO)}`)
}

/** @deprecated usar fetchEstacionesSitio */
export async function fetchEstacionesPaine() {
  return fetchEstacionesSitio()
}

export async function fetchResumenPublico(estacionId) {
  return fetchJson(`/public/meteo/${encodeURIComponent(estacionId)}`)
}

export async function fetchPronosticoPublico(estacionId, dias = 7) {
  return fetchJson(
    `/public/meteo/${encodeURIComponent(estacionId)}/pronostico?dias=${dias}`
  )
}

export function getApiBase() {
  return resolveBaseURL()
}

export { SITIO }
