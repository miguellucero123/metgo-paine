# METGO Paine

Clima y **criósfera** en **Torres del Paine** (Patagonia chilena).  
Línea **METGO Glaciares** · SPA Vue 3 + Vuex + Vite · shell visual alineado a Quillota/Copiapó (identidad **cian** `#22d3ee`).

> **Hosting canónico:** [Cloudflare Pages](https://metgo-paine.pages.dev/) (`metgo-paine`).  
> **Netlify:** en **stand-by** — no conectar builds nuevos; no usar como producción.

## Local

```bash
npm install
npm run dev
```

Puerto Vite: **5174** (evita choque con otras SPAs).

## Variables de entorno

Copia `.env.example` → `.env`:

| Variable | Uso |
|----------|-----|
| `VITE_METGO_API` | Base API (`https://metgo-api.onrender.com/api`) |
| `VITE_SUPABASE_URL` | Solo Project URL: `https://xxxx.supabase.co` (Settings → API). **Sin** `/rest/v1` ni URL del dashboard |
| `VITE_SUPABASE_ANON_KEY` | `anon` `public` (Settings → API) |

`/carretera` usa **Leaflet + OpenStreetMap** (sin API key). Sin Supabase usa seed local.

> Si abres `https://xxxx.supabase.co/` en el navegador y ves `{"error":"requested path is invalid"}`, es **normal**: esa URL es la API, no una página web.


## Auth (E9)

Login JWT contra metgo-api (misma UX que Quillota):

- Demo: `paine` / `paine123`

## Pronóstico

Open-Meteo vía `weatherService` + fallback `metgo-api` (`sitio=paine`) — **sin cambio de fuente de datos** respecto al flujo multi-sitio.

## Build / Cloudflare Pages

```bash
npm run build
npm run pages:deploy
```

| Campo CF | Valor |
|----------|-------|
| Project name | `metgo-paine` |
| Build command | `npm ci && npm run build` |
| Build output | `dist` |
| Node | `20` |

## Netlify (stand-by)

1. No vincular deploys nuevos a Netlify.
2. En el sitio Netlify antiguo: **Stop builds** / pausar auto-publish.
3. DNS y usuarios → Cloudflare Pages.

Checklist cutover (manual):

- [ ] Netlify `metgo-paine` → Site configuration → Build & deploy → **Stop builds**
- [ ] Cloudflare Pages Production: `VITE_METGO_API` (+ opcional `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` para Realtime de tramos)
- [ ] Smoke: https://metgo-paine.pages.dev/carretera (mapa Leaflet, sin banner Google)
- [ ] Login: `paine` / `paine123`

## Módulos

- Meteorología / precipitación / lugares TDP (Open-Meteo)
- Carretera Austral (`/carretera`)

## Marca

- Corporativo: https://metgo3d.com  
- Quillota: https://metgo-quillota.pages.dev  
- Este producto: https://metgo-paine.pages.dev  
