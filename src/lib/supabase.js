/**
 * Cliente Supabase (opcional). Sin env → null (usa seed local).
 */
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && anon)

export const supabase = supabaseConfigured
  ? createClient(String(url), String(anon), {
      realtime: { params: { eventsPerSecond: 5 } },
    })
  : null
