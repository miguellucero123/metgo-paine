/**
 * Autenticación JWT metgo-api (E9) + registro local legacy (favoritos offline).
 * Login productivo: authApi → /auth/login con sitio=paine.
 */

import {
  login as apiLogin,
  fetchMe,
  getToken,
  getStoredUser,
  setSession,
  clearSession,
  SITIO,
  wakeApi,
} from './authApi.js'

const REGISTERED_KEY = 'climatorre_registered_users'

function stripPassword(user) {
  if (!user) return null
  const { password: _p, ...rest } = user
  return rest
}

function loadRegistered() {
  try {
    const raw = localStorage.getItem(REGISTERED_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveRegistered(list) {
  localStorage.setItem(REGISTERED_KEY, JSON.stringify(list))
}

function findByEmail(email) {
  const list = loadRegistered()
  const normalized = String(email).trim().toLowerCase()
  return list.find((u) => u.email?.toLowerCase() === normalized) || null
}

/**
 * Login JWT. Acepta { username, password } o { email, password } (username = email).
 * @returns {Promise<{ ok: boolean, user?: object, access_token?: string, message?: string }>}
 */
export async function login({ username, email, password } = {}) {
  const userId = String(username || email || '').trim()
  if (!userId || !password) {
    return { ok: false, message: 'Usuario y contraseña requeridos' }
  }

  await wakeApi()

  try {
    const data = await apiLogin(userId, password)
    if (data.user?.sitio != null && data.user.sitio !== SITIO) {
      return {
        ok: false,
        message: `Este acceso es para el sitio ${data.user.sitio}, no ${SITIO}`,
      }
    }
    setSession(data.access_token, data.user)
    const user = {
      id: data.user?.id || data.user?.username || userId,
      nombre: data.user?.nombre || data.user?.username || userId,
      email: data.user?.email || userId,
      username: data.user?.username || userId,
      sitio: data.user?.sitio || SITIO,
      role: data.user?.role,
      favoriteIds: data.user?.favoriteIds || [],
      preferences: data.user?.preferences || { tempUnit: 'C', theme: 'dark' },
    }
    return { ok: true, user, access_token: data.access_token }
  } catch (e) {
    return { ok: false, message: e?.message || 'Usuario o contraseña incorrectos' }
  }
}

/**
 * Registro local (navegador) — no crea cuenta en metgo-api.
 * Cuentas de sitio: definir METGO_PASSWORD_* en Render (no demos en UI).
 */
export function register({ nombre, email, password }) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const exists = findByEmail(email)
      if (exists) {
        resolve({ ok: false, message: 'Ya existe una cuenta con ese correo' })
        return
      }
      const list = loadRegistered()
      const newUser = {
        id: `u-${Date.now()}`,
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        favoriteIds: [],
        preferences: { tempUnit: 'C', theme: 'dark' },
      }
      list.push(newUser)
      saveRegistered(list)
      resolve({ ok: true, user: stripPassword(newUser) })
    }, 350)
  })
}

export function logoutApi() {
  clearSession()
}

export async function ensureValidSession() {
  const token = getToken()
  if (!token) return null
  try {
    const me = await fetchMe()
    if (me?.sitio != null && me.sitio !== SITIO) {
      clearSession()
      return null
    }
    setSession(token, me)
    return {
      id: me?.id || me?.username,
      nombre: me?.nombre || me?.username,
      email: me?.email || me?.username,
      username: me?.username,
      sitio: me?.sitio || SITIO,
      role: me?.role,
      favoriteIds: me?.favoriteIds || [],
      preferences: me?.preferences || { tempUnit: 'C', theme: 'dark' },
    }
  } catch {
    clearSession()
    return null
  }
}

export function hydrateFromStorage() {
  const token = getToken()
  const stored = getStoredUser()
  if (!token || !stored) return null
  return {
    id: stored.id || stored.username,
    nombre: stored.nombre || stored.username,
    email: stored.email || stored.username,
    username: stored.username,
    sitio: stored.sitio || SITIO,
    role: stored.role,
    favoriteIds: stored.favoriteIds || [],
    preferences: stored.preferences || { tempUnit: 'C', theme: 'dark' },
  }
}

export default { login, register, logoutApi, ensureValidSession, hydrateFromStorage }
