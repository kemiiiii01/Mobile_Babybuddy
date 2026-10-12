// Contas de gestação feitas só com ano/mês/dia, sem horas, para o fuso horário
// nunca empurrar uma data para o dia vizinho.

export const GESTATION_DAYS = 280 // 40 semanas até a data prevista para o parto
const MAX_DAYS = 294              // 42 semanas: depois disso a conta deixa de fazer sentido

const pad = n => String(n).padStart(2, '0')

export function toIso(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

export function todayIso() {
  const now = new Date()
  return toIso(now.getFullYear(), now.getMonth(), now.getDate())
}

// '2026-10-15' -> [2026, 9, 15]; null se não for uma data real
export function parseIso(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '')
  if (!match) return null
  const [y, m, d] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])]
  const date = new Date(y, m, d)
  return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d ? [y, m, d] : null
}

// 15/10/2026 -> 2026-10-15 (null se estiver incompleta ou não existir)
export function brToIso(br) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(br || '')
  if (!match) return null
  const iso = `${match[3]}-${match[2]}-${match[1]}`
  return parseIso(iso) ? iso : null
}

// 2026-10-15 -> 15/10/2026
export function isoToBr(iso) {
  const parts = parseIso(iso)
  return parts ? `${pad(parts[2])}/${pad(parts[1] + 1)}/${parts[0]}` : ''
}

// Vai colocando as barras enquanto a pessoa digita: 15102026 -> 15/10/2026
export function maskDate(text) {
  const digits = text.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

// dias corridos de `fromIso` até `toIso`
export function diffDays(fromIso, untilIso) {
  const a = parseIso(fromIso), b = parseIso(untilIso)
  if (!a || !b) return null
  return Math.round((Date.UTC(...b) - Date.UTC(...a)) / 86400000)
}

// Posição de uma data dentro da gestação, a partir da data prevista para o parto.
// Devolve null se não houver data prevista válida ou se a data cair fora da gravidez.
export function gestationOn(dueIso, dateIso) {
  const untilDue = diffDays(dateIso, dueIso)
  if (untilDue === null) return null
  const days = GESTATION_DAYS - untilDue
  if (days < 0 || days > MAX_DAYS) return null
  return {
    days,
    weeks: Math.floor(days / 7),
    extraDays: days % 7,
    trimester: days < 14 * 7 ? 1 : days < 28 * 7 ? 2 : 3,
    daysLeft: Math.max(0, untilDue),
  }
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`
