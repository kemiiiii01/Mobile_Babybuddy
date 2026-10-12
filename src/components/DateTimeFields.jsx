import { useEffect, useRef, useState } from 'react'
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from './Icon'
import { colors, fonts, layout, radius } from '../theme'

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const YEARS_PER_PAGE = 12
const ROW_HEIGHT = 36
const WHEEL_ROWS = 5
const WHEEL_FADE = [1, 0.45, 0.2, 0.08]
const HIT = { top: 12, bottom: 12, left: 12, right: 12 }
const pad = n => String(n).padStart(2, '0')
const HOURS = Array.from({ length: 24 }, (_, i) => pad(i))
const MINUTES = Array.from({ length: 60 }, (_, i) => pad(i))

function FieldButton({ label, icon, text, placeholder, error, onPress }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.field, error && styles.fieldErr]}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${text || placeholder}`}
      >
        <Icon name={icon} color={colors.gray} size={17} />
        <Text style={[styles.value, !text && styles.placeholder]} numberOfLines={1}>{text || placeholder}</Text>
      </TouchableOpacity>
    </View>
  )
}

// Campo de data: abre o calendário e devolve a data em AAAA-MM-DD.
export function DateField({ label, value, placeholder = 'Selecione', error, disablePast = false, onChange }) {
  const [open, setOpen] = useState(false)
  const [y, m, d] = value ? value.split('-').map(Number) : []
  return (
    <>
      <FieldButton
        label={label} icon="cal" placeholder={placeholder} error={error} onPress={() => setOpen(true)}
        text={value ? `${pad(d)}/${pad(m)}/${y}` : ''}
      />
      <CalendarModal
        visible={open} value={value} disablePast={disablePast}
        onPick={onChange} onClose={() => setOpen(false)}
      />
    </>
  )
}

// Calendário em janela. Devolve a data escolhida em AAAA-MM-DD por onPick e fecha.
// Tocar no título alterna dias -> meses -> anos, para chegar rápido a uma data distante.
// Com disablePast, nada anterior ao dia de hoje pode ser escolhido.
// startAt (AAAA-MM-DD) é o mês mostrado ao abrir quando ainda não há data escolhida.
export function CalendarModal({ visible, value, startAt, disablePast = false, onPick, onClose }) {
  const [view, setView] = useState({ year: 0, month: 0 })
  const [mode, setMode] = useState('days') // days | months | years
  const [y, m, d] = value ? value.split('-').map(Number) : []

  // Cada vez que abre, volta para o mês da data escolhida (ou startAt, ou hoje).
  useEffect(() => {
    if (!visible) return
    const [by, bm] = (value || startAt || '').split('-').map(Number)
    const base = by && bm ? new Date(by, bm - 1, 1) : new Date()
    setView({ year: base.getFullYear(), month: base.getMonth() })
    setMode('days')
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  // As setas andam um mês, um ano ou uma página de anos, conforme o que está na tela.
  function move(step) {
    setView(v => {
      if (mode === 'months') return { ...v, year: v.year + step }
      if (mode === 'years') return { ...v, year: v.year + step * YEARS_PER_PAGE }
      const next = new Date(v.year, v.month + step, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }
  function pick(day) {
    onPick(`${view.year}-${pad(view.month + 1)}-${pad(day)}`)
    onClose()
  }

  const blanks = new Date(view.year, view.month, 1).getDay()
  const days = new Date(view.year, view.month + 1, 0).getDate()
  const today = new Date()
  const [ty, tm, td] = [today.getFullYear(), today.getMonth(), today.getDate()]
  const firstYear = view.year - (view.year % YEARS_PER_PAGE)
  const pastYear = year => disablePast && year < ty
  const pastMonth = (year, month) => disablePast && (year < ty || (year === ty && month < tm))
  const pastDay = day => pastMonth(view.year, view.month) || (disablePast && view.year === ty && view.month === tm && day < td)
  // A seta de voltar trava quando tudo o que ela mostraria já passou.
  const prevBlocked = mode === 'days' ? pastMonth(view.year, view.month - 1)
    : mode === 'months' ? pastYear(view.year - 1)
    : pastYear(firstYear - 1)
  const title = mode === 'days' ? `${MONTHS[view.month]} ${view.year}`
    : mode === 'months' ? String(view.year)
    : `${firstYear} – ${firstYear + YEARS_PER_PAGE - 1}`
  const unit = mode === 'days' ? 'Mês' : mode === 'months' ? 'Ano' : 'Período'

  return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar" />
          <View style={styles.card}>
            <View style={styles.monthRow}>
              <TouchableOpacity
                style={styles.navBtn}
                onPress={() => move(-1)}
                disabled={prevBlocked}
                accessibilityLabel={`${unit} anterior`}
              >
                <Icon name="back" color={prevBlocked ? colors.line : colors.black} size={20} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.titleBtn}
                onPress={() => setMode(mode === 'days' ? 'months' : mode === 'months' ? 'years' : 'days')}
                accessibilityRole="button"
                accessibilityLabel={`${title}, trocar mês e ano`}
              >
                <Text style={styles.monthTitle}>{title}</Text>
                <Icon name="down" color={colors.black} size={14} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn} onPress={() => move(1)} accessibilityLabel={`${unit} seguinte`}>
                <Icon name="fwd" color={colors.black} size={20} />
              </TouchableOpacity>
            </View>

            {mode === 'months' && (
              <View style={styles.grid}>
                {MONTHS_SHORT.map((name, i) => {
                  const selected = value && y === view.year && m === i + 1
                  const blocked = pastMonth(view.year, i)
                  return (
                    <TouchableOpacity
                      key={name}
                      style={styles.bigCell}
                      disabled={blocked}
                      onPress={() => { setView(v => ({ ...v, month: i })); setMode('days') }}
                      accessibilityRole="button"
                      accessibilityLabel={`${MONTHS[i]} de ${view.year}`}
                    >
                      <View style={[styles.bigItem, i === view.month && styles.dayToday, selected && styles.daySelected]}>
                        <Text style={[styles.dayText, blocked && styles.dayTextBlocked, selected && styles.dayTextSelected]}>{name}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}

            {mode === 'years' && (
              <View style={styles.grid}>
                {Array.from({ length: YEARS_PER_PAGE }, (_, i) => firstYear + i).map(year => {
                  const selected = value && y === year
                  const blocked = pastYear(year)
                  return (
                    <TouchableOpacity
                      key={year}
                      style={styles.bigCell}
                      disabled={blocked}
                      onPress={() => { setView(v => ({ ...v, year })); setMode('months') }}
                      accessibilityRole="button"
                      accessibilityLabel={`Ano ${year}`}
                    >
                      <View style={[styles.bigItem, year === view.year && styles.dayToday, selected && styles.daySelected]}>
                        <Text style={[styles.dayText, blocked && styles.dayTextBlocked, selected && styles.dayTextSelected]}>{year}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}

            {mode === 'days' && <View style={styles.grid}>
              {WEEKDAYS.map((w, i) => <Text key={`w${i}`} style={styles.weekday}>{w}</Text>)}
              {Array.from({ length: blanks }, (_, i) => <View key={`b${i}`} style={styles.cell} />)}
              {Array.from({ length: days }, (_, i) => {
                const day = i + 1
                const selected = value && y === view.year && m === view.month + 1 && d === day
                const isToday = ty === view.year && tm === view.month && td === day
                const blocked = pastDay(day)
                return (
                  <TouchableOpacity
                    key={day}
                    style={styles.cell}
                    disabled={blocked}
                    onPress={() => pick(day)}
                    accessibilityRole="button"
                    accessibilityLabel={`${day} de ${MONTHS[view.month]} de ${view.year}`}
                    accessibilityState={{ selected: !!selected, disabled: blocked }}
                  >
                    <View style={[styles.day, isToday && styles.dayToday, selected && styles.daySelected]}>
                      <Text style={[styles.dayText, blocked && styles.dayTextBlocked, selected && styles.dayTextSelected]}>{day}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>}
          </View>
        </View>
      </Modal>
  )
}

// Roda no estilo do seletor do iOS: a lista gira e o valor escolhido é o que para
// na faixa central; os vizinhos vão esmaecendo conforme se afastam do centro.
function Wheel({ data, selected, onSelect, label }) {
  const ref = useRef(null)
  const index = Math.max(0, data.indexOf(selected))

  function scrollTo(i, animated) {
    ref.current?.scrollTo({ y: i * ROW_HEIGHT, animated })
  }
  function onScroll(e) {
    const i = Math.round(e.nativeEvent.contentOffset.y / ROW_HEIGHT)
    const next = data[Math.min(data.length - 1, Math.max(0, i))]
    if (next !== selected) onSelect(next)
  }

  return (
    <ScrollView
      ref={ref}
      style={styles.wheel}
      contentContainerStyle={styles.wheelContent}
      showsVerticalScrollIndicator={false}
      snapToInterval={ROW_HEIGHT}
      decelerationRate="fast"
      scrollEventThrottle={16}
      onScroll={onScroll}
      onLayout={() => scrollTo(index, false)}
      accessibilityLabel={label}
    >
      {data.map((item, i) => {
        const distance = Math.abs(i - index)
        return (
          <TouchableOpacity
            key={item}
            style={styles.wheelRow}
            onPress={() => scrollTo(i, true)}
            activeOpacity={0.6}
            accessibilityRole="button"
            accessibilityLabel={`${item} ${label}`}
            accessibilityState={{ selected: distance === 0 }}
          >
            <Text style={[styles.wheelText, { opacity: WHEEL_FADE[Math.min(distance, WHEEL_FADE.length - 1)] }]}>
              {item}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

// Campo de horário opcional: devolve HH:MM, ou '' ao limpar.
export function TimeField({ label, value, placeholder = 'Selecione', onChange }) {
  const [open, setOpen] = useState(false)
  const [hour, setHour] = useState('08')
  const [minute, setMinute] = useState('00')

  function show() {
    const [h, min] = value ? value.split(':') : ['08', '00']
    setHour(h); setMinute(min)
    setOpen(true)
  }
  function close(next) {
    if (next !== undefined) onChange(next)
    setOpen(false)
  }

  return (
    <>
      <FieldButton label={label} icon="clock" placeholder={placeholder} onPress={show} text={value} />
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => close()}>
        <Pressable style={styles.sheetBackdrop} onPress={() => close()} accessibilityLabel="Fechar" />
        <View style={styles.sheet}>
          <View style={styles.toolbar}>
            <TouchableOpacity onPress={() => close('')} hitSlop={HIT} accessibilityRole="button">
              <Text style={styles.toolbarText}>Limpar</Text>
            </TouchableOpacity>
            <Text style={styles.toolbarTitle}>{label.replace(' (opcional)', '')}</Text>
            <TouchableOpacity onPress={() => close(`${hour}:${minute}`)} hitSlop={HIT} accessibilityRole="button">
              <Text style={[styles.toolbarText, styles.toolbarDone]}>OK</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.wheels}>
            <View style={styles.wheelBand} pointerEvents="none" />
            <Wheel data={HOURS} selected={hour} onSelect={setHour} label="horas" />
            <Text style={styles.wheelColon}>:</Text>
            <Wheel data={MINUTES} selected={minute} onSelect={setMinute} label="minutos" />
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.inkSoft, marginBottom: 6 },
  field: {
    height: 46, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.input, paddingHorizontal: 12,
  },
  fieldErr:    { borderColor: colors.danger },
  value:       { flex: 1, fontSize: 15, fontFamily: fonts.regular, color: colors.ink },
  placeholder: { color: colors.grayLight },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: {
    width: '100%', maxWidth: 320, backgroundColor: colors.white, borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 12,
  },
  monthRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  monthTitle: { fontSize: 16, fontFamily: fonts.bold, color: colors.ink, textAlign: 'center' },
  navBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  titleBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 12,
    borderRadius: 17, backgroundColor: colors.grayBg,
  },
  bigCell: { width: `${100 / 3}%`, height: 48, alignItems: 'center', justifyContent: 'center' },
  bigItem: {
    minWidth: 70, height: 36, borderRadius: 18, paddingHorizontal: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  grid:       { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: {
    width: `${100 / 7}%`, textAlign: 'center', paddingVertical: 6,
    fontSize: 11, fontFamily: fonts.semiBold, color: colors.gray,
  },
  cell: { width: `${100 / 7}%`, height: 38, alignItems: 'center', justifyContent: 'center' },
  day:  { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayToday:        { backgroundColor: colors.primaryPale },
  daySelected:     { backgroundColor: colors.primary },
  // A League Spartan desenha os números acima do meio da linha; o paddingTop
  // desce o texto 1,5px para ele ficar no centro do círculo.
  dayText:         { fontSize: 14, fontFamily: fonts.medium, color: colors.ink, paddingTop: 3 },
  dayTextBlocked:  { color: colors.grayLight },
  dayTextSelected: { color: colors.white, fontFamily: fonts.bold },

  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center',
    backgroundColor: colors.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 24,
  },
  toolbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 48, borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  toolbarTitle: { fontSize: 15, fontFamily: fonts.semiBold, color: colors.ink },
  toolbarText:  { fontSize: 16, fontFamily: fonts.regular, color: colors.gray },
  toolbarDone:  { fontFamily: fonts.bold, color: colors.primary },
  wheels: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: ROW_HEIGHT * WHEEL_ROWS, marginTop: 8, paddingHorizontal: 20,
  },
  // faixa cinza arredondada que marca a linha selecionada, como no iOS
  wheelBand: {
    position: 'absolute', left: 20, right: 20, top: ROW_HEIGHT * ((WHEEL_ROWS - 1) / 2), height: ROW_HEIGHT,
    borderRadius: 10, backgroundColor: colors.grayBg,
  },
  wheel:        { width: 84, flexGrow: 0, height: ROW_HEIGHT * WHEEL_ROWS, ...Platform.select({ web: { scrollSnapType: 'y mandatory' } }) },
  wheelContent: { paddingVertical: ROW_HEIGHT * ((WHEEL_ROWS - 1) / 2) },
  wheelRow: {
    height: ROW_HEIGHT, alignItems: 'center', justifyContent: 'center',
    ...Platform.select({ web: { scrollSnapAlign: 'center' } }),
  },
  wheelText:  { fontSize: 23, fontFamily: fonts.regular, color: colors.black },
  wheelColon: { fontSize: 23, fontFamily: fonts.regular, color: colors.black, paddingHorizontal: 6 },
})
