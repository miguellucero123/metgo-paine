/**
 * Cliente público metgo-api (sitio desde site.config.js).
 * Sin JWT — endpoints /api/public/*
 */
import site from '@/site.config.js'

const RENDER_API = site.api?.defaultPublicBase || 'https://metgo-api.onrender.com/api'
const SITIO = site.sitio
const TIMEOUT_MS = 45000

function resolveBaseURL() {
  const fromEnv = import.meta.env.VITE_METGO_API || import.meta.env.VITE_API_BASE
  if (fromEnv) return String(fromEnv).replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')) {
    return RENDER_API
  }
  return site.api?.localBase || 'http://127.0.0.1:8080/api'
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
