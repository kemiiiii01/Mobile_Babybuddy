import { isoToBr as formatIso } from './gestation'

// Categorias de lembrete. O valor salvo em `cat` é a própria etiqueta; ícone e
// etiqueta saem sempre daqui, nunca de uma escolha manual da usuária.
export const REMINDER_CATEGORIES = [
  { value: 'Medicamento', label: 'Medicamento', icon: 'pill' },
  { value: 'Consulta',    label: 'Consulta',    icon: 'steth' },
  { value: 'Exame',       label: 'Exame',       icon: 'exam' },
  { value: 'Pré-natal',   label: 'Pré-natal',   icon: 'prenatal' },
]

// Lembretes antigos podem ter a categoria "Outro", que saiu do cadastro.
const FALLBACK = { value: 'Outro', label: 'Outro', icon: 'bell' }

export function reminderCategory(cat) {
  return REMINDER_CATEGORIES.find(c => c.value === cat) || { ...FALLBACK, label: cat || FALLBACK.label }
}

export const REMINDER_FREQUENCIES = ['Uma vez', 'Diariamente', 'Semanalmente', 'Mensalmente']

// As únicas três cores de destaque que um lembrete pode ter; a primeira é a padrão.
export const REMINDER_COLORS = [
  { value: '#E94E91', label: 'Rosa' },
  { value: '#CDB8EA', label: 'Lilás' },
  { value: '#9DE3B7', label: 'Verde-claro' },
]

// Lembretes antigos podem ter outra cor salva: caem na padrão.
export function reminderColor(color) {
  return REMINDER_COLORS.some(c => c.value === color) ? color : REMINDER_COLORS[0].value
}

// Datas salvas em outro formato (lembretes antigos) aparecem como estão.
export function isoToBr(iso) {
  return formatIso(iso) || iso || ''
}

export function reminderInfo(r) {
  return [isoToBr(r.date), r.time, r.freq && r.freq !== 'Uma vez' ? r.freq : null].filter(Boolean).join(' · ')
}
