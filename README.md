# METGO Paine

Clima y **criósfera** en **Torres del Paine** (Patagonia chilena).  
Línea **METGO Glaciares** · SPA Vue 3 + Vuex + Vite · datos Open-Meteo + metgo-api.

> Hosting canónico: **Cloudflare Pages** (`metgo-paine`).  
> Netlify (`metgo-paine.netlify.app`) se mantiene solo por compatibilidad; stop builds tras cutover.

## Local

```bash
npm install
npm run dev
```

Puerto Vite por defecto: **5173** (o el que asigne Vite).

## Variables de entorno

Copia `.env.example` → `.env`:

| Variable | Uso |
|----------|-----|
| `VITE_METGO_API` | Base API (`https://metgo-api.onrender.com/api`) |
| `VITE_SUPABASE_URL` | Supabase (módulo Carretera Austral) |
| `VITE_SUPABASE_ANON_KEY` | Anon key Supabase |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Maps JS API (ruta `/carretera`) |

Sin Supabase/Maps, `/carretera` usa seed local embebido.

## Auth (E9)

Login JWT contra metgo-api, sitio `paine`:

- Demo: `paine` / `paine123`
- Admin multi-sitio: `admin` / `admin123` (si aplica)

## Build / Cloudflare Pages

```bash
npm run build
# Deploy manual:
npm run pages:deploy
```

| Campo CF | Valor |
|----------|-------|
| Project name | `metgo-paine` |
| Build command | `npm ci && npm run build` |
| Build output | `dist` |
| Node | `20` |

Proxy SPA + API: `public/_redirects` → `/api/*` a Render.

## Cutover desde Netlify

1. Deploy en Cloudflare Pages y validar `/`, `/meteo`, login, `/api/health`.
2. Añadir `https://metgo-paine.pages.dev` a `METGO_CORS_ORIGINS` en Render (plantilla en monorepo `render.yaml`).
3. En Netlify: **Stop builds**.
4. (Opcional) Dominio custom en CF Pages.

## Módulos

- Meteorología / precipitación / lugares TDP
- **Carretera Austral** (`/carretera`) — mapa Google Maps + tramos pavimento/ripio (Supabase Realtime)

## Marca

- Sitio corporativo: https://metgo3d.com  
- Plataforma Quillota: https://metgo-quillota.pages.dev  
- Este producto: clima TDP / glaciares / rutas Patagonia
