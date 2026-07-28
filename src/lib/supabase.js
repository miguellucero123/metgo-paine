/**
 * Cliente Supabase (opcional). Sin env → null (usa seed local).
 *
 * VITE_SUPABASE_URL debe ser SOLO el Project URL, p.ej.:
 *   https://ylivhjigvxqzpzchllte.supabase.co
 * NO uses /rest/v1, ni la URL del dashboard, ni db.xxx.supabase.co
 */
import { createClient } from '@supabase/supabase-js'

function normalizeSupabaseUrl(raw) {
  if (!raw) return ''
  let u = String(raw).trim().replace(/\/+$/, '')
  // Si pegaron .../rest/v1 o .../rest/v1/tabla → dejar solo el host del proyecto
  u = u.replace(/\/rest\/v1(\/.*)?$/i, '')
  u = u.replace(/\/auth\/v1(\/.*)?$/i, '')
  u = u.replace(/\/storage\/v1(\/.*)?$/i, '')
  // Dashboard no es el API URL
  if (/supabase\.com\/dashboard/i.test(u)) {
    console.warn(
      '[supabase] VITE_SUPABASE_URL parece el dashboard. Usa Project URL (Settings → API), p.ej. https://xxxx.supabase.co'
    )
    return ''
  }
  if (/^https?:\/\/db\./i.test(u)) {
    console.warn(
      '[supabase] No uses db.xxx.supabase.co. Usa https://xxxx.supabase.co (Settings → API → Project URL).'
    )
    return ''
  }
  return u
}

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const anon = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const supabaseConfigured = Boolean(url && anon)

export const supabase = supabaseConfigured
  ? createClient(url, anon, {
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null
