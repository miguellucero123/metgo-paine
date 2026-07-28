/**
 * Base URL metgo-api — misma lógica que Quillota/Copiapó en Cloudflare.
 * Dev sin Flask: Render por defecto. API local solo si VITE_METGO_API apunta a 127.0.0.1.
 */
import site from '@/site.config.js'

export const RENDER_METGO_API =
  site.api?.defaultPublicBase || 'https://metgo-api.onrender.com/api'

export function resolveMetgoApiBase() {
  const fromEnv = import.meta.env.VITE_METGO_API || import.meta.env.VITE_API_BASE
  if (fromEnv) {
    return String(fromEnv).replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (
      host.includes('netlify.app') ||
      host.includes('pages.dev') ||
      host === 'localhost' ||
      host === '127.0.0.1'
    ) {
      return RENDER_METGO_API
    }
  }

  return RENDER_METGO_API
}
