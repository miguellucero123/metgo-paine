/**
 * Auth JWT metgo-api (E9) — sitio Paine.
 * Patrón Copiapó/Mantos; adapta resolveBaseURL a site.config.
 */
import site from '@/site.config.js'
import { resolveMetgoApiBase } from '@/utils/resolveMetgoApiBase.js'

const TOKEN_KEY = `${site.storagePrefix || 'metgo'}_access_token`
const USER_KEY = `${site.storagePrefix || 'metgo'}_user`
const SITIO = site.sitio
const TIMEOUT_MS = 60000

function resolveBaseURL() {
  return resolveMetgoApiBase()
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request(path, { method = 'GET', body, auth = false, timeout = TIMEOUT_MS } = {}) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeout)
  const headers = { Accept: 'application/json' }
  if (body != null) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  try {
    const res = await fetch(`${resolveBaseURL()}${path}`, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data.error || `HTTP ${res.status}`)
      err.status = res.status
      err.data = data
      throw err
    }
    return data
  } finally {
    clearTimeout(t)
  }
}

export async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: { username, password, sitio: SITIO },
  })
}

export async function fetchMe() {
  return request('/auth/me', { auth: true })
}

export async function wakeApi() {
  try {
    await request('/health', { timeout: 25000 })
    return true
  } catch {
    return false
  }
}

export async function validateRegistro(body) {
  try {
    return await request('/auth/validate-registro', { method: 'POST', body })
  } catch (e) {
    if (e.data && typeof e.data.ok === 'boolean') return e.data
    throw e
  }
}

export async function registerV2(body) {
  return request('/auth/register-v2', { method: 'POST', body, timeout: 90000 })
}

export async function verifyEmail(token) {
  return request(`/auth/verify-email?token=${encodeURIComponent(token)}`)
}

export async function fetchPlanes(sitio = SITIO, faena) {
  const q = new URLSearchParams({ sitio })
  if (faena) q.set('faena', faena)
  return request(`/public/planes?${q}`)
}

export { TOKEN_KEY, USER_KEY, SITIO, resolveBaseURL }
