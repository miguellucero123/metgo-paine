/** Fechas cortas para ejes de charts (compat Quillota). */

export function formatoDiaCorto(fecha) {
  const s = String(fecha ?? '')
  // "Lunes" / día de semana → devolver tal cual
  if (!/^\d{4}-\d{2}-\d{2}/.test(s) && s.length < 12) return s.slice(0, 10) || s
  const d = s.slice(0, 10)
  if (d.length < 10) return d
  const [, mm, dd] = d.split('-')
  return `${dd}/${mm}`
}
