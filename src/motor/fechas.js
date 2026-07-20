// ============================================================
// fechas — utilidades de fechas sin dependencias externas.
// Se trabaja siempre a medianoche local para evitar sorpresas por horas.
// ============================================================

/**
 * Normaliza una fecha (Date o string) a medianoche LOCAL.
 * Un string "AAAA-MM-DD" se interpreta como fecha local (no UTC), para evitar
 * corrimientos de un día según la zona horaria del dispositivo.
 */
export function aMedianoche(fecha) {
  if (typeof fecha === 'string') {
    const soloFecha = /^(\d{4})-(\d{2})-(\d{2})/.exec(fecha)
    if (soloFecha) {
      const [, a, m, d] = soloFecha
      return new Date(Number(a), Number(m) - 1, Number(d), 0, 0, 0, 0)
    }
  }
  const d = fecha instanceof Date ? new Date(fecha) : new Date(fecha)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Días completos entre dos fechas (b - a). Positivo si b es posterior.
 */
export function diasEntre(a, b) {
  const ma = aMedianoche(a)
  const mb = aMedianoche(b)
  return Math.round((mb - ma) / 86400000)
}

/**
 * Suma (o resta) días a una fecha y devuelve un nuevo Date a medianoche.
 */
export function sumarDias(fecha, dias) {
  const d = aMedianoche(fecha)
  d.setDate(d.getDate() + dias)
  return d
}

/**
 * Formatea una fecha a "AAAA-MM-DD" (clave estable para comparar días).
 */
export function claveDia(fecha) {
  const d = aMedianoche(fecha)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre',
]

/**
 * Texto amable en español peruano: "martes 15 de julio".
 */
export function fechaLarga(fecha) {
  const d = aMedianoche(fecha)
  return `${DIAS_SEMANA[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`
}

/**
 * Nombre del mes y año: "julio 2026".
 */
export function mesYAnio(fecha) {
  const d = aMedianoche(fecha)
  return `${MESES[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * Número de día del año (1-366). Sirve como semilla estable para rotar
 * contenido "del día" (misión, tip) sin repetir dentro del mismo día.
 */
export function diaDelAnio(fecha = new Date()) {
  const d = aMedianoche(fecha)
  const inicio = new Date(d.getFullYear(), 0, 0)
  return Math.floor((d - inicio) / 86400000)
}

/**
 * Clave estable de la semana ISO ("AAAA-Www") para agrupar registros
 * semanales (termómetro, citas). Lunes como inicio de semana.
 */
export function claveSemana(fecha = new Date()) {
  const d = aMedianoche(fecha)
  // Ajuste ISO: jueves de la semana define el año.
  const dia = (d.getDay() + 6) % 7 // lunes=0
  d.setDate(d.getDate() - dia + 3)
  const primerJueves = new Date(d.getFullYear(), 0, 4)
  const semana =
    1 +
    Math.round(
      ((d - primerJueves) / 86400000 - 3 + ((primerJueves.getDay() + 6) % 7)) / 7,
    )
  return `${d.getFullYear()}-W${String(semana).padStart(2, '0')}`
}

/**
 * Fin del día de hoy (23:59:59) en ISO. Se usa para expirar las alertas de
 * estado a medianoche.
 */
export function finDelDia(fecha = new Date()) {
  const d = aMedianoche(fecha)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

/**
 * ¿La fecha ISO dada ya expiró respecto a ahora?
 */
export function estaExpirado(isoFecha) {
  if (!isoFecha) return false
  return new Date(isoFecha).getTime() < Date.now()
}

export { MESES, DIAS_SEMANA }
