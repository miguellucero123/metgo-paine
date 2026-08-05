/**
 * Restringe la ruta post-login a navegación interna de la SPA (rúbrica: redirect tras login).
 * Evita valores maliciosos en ?redirect= (p. ej. otras origen).
 *
 * @param {unknown} path
 * @returns {string}
 */
export function sanitizeRedirectPath(path) {
  if (typeof path !== 'string' || !path.trim()) return '/app';
  const t = path.trim();
  if (!t.startsWith('/')) return '/app';
  if (t.startsWith('//')) return '/app';
  if (t.includes('://')) return '/app';
  if (t === '/' || t === '/login' || t === '/registro' || t === '/verificar') return '/app';
  return t;
}
