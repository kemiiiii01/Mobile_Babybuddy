import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { colors, fonts, layout } from '../theme'
import { isoToBr, reminderCategory } from '../constants/reminders'
import { GESTATION_DAYS, gestationOn, parseIso, plural, toIso, todayIso } from '../constants/gestation'

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
const MIN_YEAR = 2024, MAX_YEAR = 2030

// 15 de outubro de 2026
function dateLong(iso) {
  const [y, m, d] = parseIso(iso)
  return `${d} de ${MONTHS[m].toLowerCase()} de ${y}`
}

// Eventos e lembretes viram um único tipo de item, para o calendário mostrar tudo junto.
function toItems(events, reminders) {
  return [
    ...events.map(e => ({
      key: `e_${e.id}`, kind: 'event', id: e.id, title: e.title, date: e.date, time: e.time,
      icon: 'cal', tag: 'Evento', place: e.local, notes: e.notes,
    })),
    ...reminders.map(r => {
      const cat = reminderCategory(r.cat)
      return {
        key: `r_${r.id}`, kind: 'reminder', id: r.id, title: r.title, date: r.date, time: r.time,
        icon: cat.icon, tag: cat.label, notes: r.notes, freq: r.freq, done: r.done,
      }
    }),
  ].filter(item => parseIso(item.date))
    .sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  )
}

export default function CalendarScreen({ navigation }) {
  const { profile, events, reminders, deleteEvent, calMonth, setCalMonth, calYear, setCalYear } = useApp()
  const { width: windowWidth } = useWindowDimensions()
  const narrow = windowWidth < 360
  const today = todayIso()
  const [selected, setSelected] = useState(today)
  const [showAll, setShowAll] = useState(false)
  const [detailKey, setDetailKey] = useState(null)
  const [dayOpen, setDayOpen] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const m = calMonth, y = calYear
  const blanks = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const atStart = y === MIN_YEAR && m === 0
  const atEnd   = y === MAX_YEAR && m === 11

  function prevMonth() {
    if (atStart) return
    if (m === 0) { setCalYear(y - 1); setCalMonth(11) } else setCalMonth(m - 1)
  }
  function nextMonth() {
    if (atEnd) return
    if (m === 11) { setCalYear(y + 1); setCalMonth(0) } else setCalMonth(m + 1)
  }

  // A data prevista para o parto aparece no calendário com um marcador próprio (coração)
  // e entra nas listas como um item, mas não conta como compromisso cadastrado.
  const dueIso = parseIso(profile.due) ? profile.due : null
  const dueItem = dueIso && {
    key: 'due', kind: 'due', title: 'Data prevista para o parto', date: dueIso, time: '',
    icon: 'heart', tag: 'Gestação', notes: '40 semanas de gestação',
  }
  const scheduled = toItems(events, reminders)
  const items = dueItem
    ? [...scheduled, dueItem].sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')))
    : scheduled
  const monthPrefix = toIso(y, m, 1).slice(0, 8)
  const daysWithItems = new Set(scheduled.filter(i => i.date.startsWith(monthPrefix)).map(i => i.date))
  const shown = showAll ? items : items.filter(i => i.date === selected)
  const detail = items.find(i => i.key === detailKey) || null

  const gestation = gestationOn(profile.due, today)
  const selectedGestation = gestationOn(profile.due, selected)
  // Sem data prevista não dá para contar os dias; mostra só as semanas que a usuária informou.
  const weeksOnly = !gestation && profile.weeks ? parseInt(profile.weeks, 10) : null

  function closeSheet() {
    setDayOpen(false)
    setDetailKey(null)
    setShowAll(false)
  }
  function askDelete() {
    // Fecha o painel antes de abrir a confirmação, para não empilhar dois modais.
    setDeleting(detail)
    closeSheet()
  }
  function confirmDelete() {
    deleteEvent(deleting.id)
    setDeleting(null)
  }
  function openReminders() {
    closeSheet()
    navigation.navigate('Lembretes')
  }
  function openPersonalData() {
    closeSheet()
    navigation.navigate('PersonalData')
  }

  const dayCount = items.filter(i => i.date === selected).length
  const aboutTitle = selected === today ? 'Sobre o dia de hoje' : 'Sobre o dia selecionado'

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
          <Icon name="back" color={colors.black} size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">Calendário da gestação</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Resumo da gestação */}
        {gestation || weeksOnly ? (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Você está com</Text>
                <Text style={styles.summaryValue}>{plural(gestation ? gestation.weeks : weeksOnly, 'semana', 'semanas')}</Text>
                <Text style={styles.summaryLabel}>
                  {gestation && gestation.extraDays > 0 ? `e ${plural(gestation.extraDays, 'dia', 'dias')} de gestação` : 'de gestação'}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              {gestation ? (
                <View style={styles.summaryCol}>
                  <Text style={styles.summaryLabel}>{gestation.daysLeft > 0 ? 'Faltam' : 'Chegou a'}</Text>
                  <Text style={styles.summaryValue}>
                    {gestation.daysLeft > 0 ? plural(gestation.daysLeft, 'dia', 'dias') : '40ª semana'}
                  </Text>
                  <Text style={styles.summaryLabel}>{gestation.daysLeft > 0 ? 'para a 40ª semana' : 'data prevista do parto'}</Text>
                </View>
              ) : (
                // Só as semanas foram informadas: sem a data prevista não dá para contar os dias.
                <TouchableOpacity
                  style={styles.summaryCol}
                  onPress={() => navigation.navigate('PersonalData')}
                  accessibilityRole="button"
                >
                  <Text style={styles.summaryLabel}>Informe a data prevista do parto para ver os dias</Text>
                  <Text style={styles.summaryLink}>Dados Pessoais</Text>
                </TouchableOpacity>
              )}
            </View>
            {gestation && (
              <View
                accessibilityRole="progressbar"
                accessibilityLabel={`${plural(gestation.days, 'dia', 'dias')} de gestação, faltam ${plural(gestation.daysLeft, 'dia', 'dias')} para a data prevista`}
              >
                <View style={styles.progressBg}>
                  <View style={[styles.progressBar, { width: `${Math.min(100, (gestation.days / GESTATION_DAYS) * 100)}%` }]} />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressText}>{plural(gestation.days, 'dia', 'dias')} de gestação</Text>
                  <Text style={styles.progressText}>
                    {gestation.daysLeft > 0 ? `faltam ${plural(gestation.daysLeft, 'dia', 'dias')}` : 'data prevista alcançada'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.summary, styles.summaryRow]}
            onPress={() => navigation.navigate('PersonalData')}
            activeOpacity={0.8}
            accessibilityRole="button"
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryTitle}>Configure sua gestação</Text>
              <Text style={styles.summarySub}>
                Informe a data prevista para o parto em Dados Pessoais para acompanhar semanas e dias.
              </Text>
            </View>
            <Icon name="fwd" color={colors.primary} size={16} />
          </TouchableOpacity>
        )}

        {/* Calendário do mês */}
        <View style={styles.calendar}>
          <View style={styles.monthRow}>
            <TouchableOpacity style={styles.headerBtn} onPress={prevMonth} disabled={atStart} accessibilityLabel="Mês anterior">
              <Icon name="back" color={atStart ? colors.line : colors.black} size={20} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{MONTHS[m]} {y}</Text>
            <TouchableOpacity style={styles.headerBtn} onPress={nextMonth} disabled={atEnd} accessibilityLabel="Próximo mês">
              <Icon name="fwd" color={atEnd ? colors.line : colors.black} size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.grid}>
            {WEEKDAYS.map((w, i) => <Text key={`w${i}`} style={styles.weekday}>{w}</Text>)}
            {Array.from({ length: blanks }, (_, i) => <View key={`b${i}`} style={styles.cell} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const iso = toIso(y, m, day)
              const isSelected = iso === selected
              const isToday = iso === today
              const hasItems = daysWithItems.has(iso)
              const isDue = iso === dueIso
              return (
                <TouchableOpacity
                  key={day}
                  style={styles.cell}
                  onPress={() => setSelected(iso)}
                  accessibilityRole="button"
                  accessibilityLabel={`${day} de ${MONTHS[m]}${isToday ? ', hoje' : ''}${isDue ? ', data prevista para o parto' : ''}${hasItems ? ', com eventos' : ''}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={[styles.day, isSelected && styles.daySelected, isToday && styles.dayToday, isDue && styles.dayDue]}>
                    <Text style={[styles.dayText, (isSelected || isToday) && styles.dayTextAccent, isDue && styles.dayTextDue]}>{day}</Text>
                  </View>
                  <View style={[styles.dot, hasItems && styles.dotOn]} />
                </TouchableOpacity>
              )
            })}
          </View>
          {daysWithItems.size === 0 && (
            <Text style={styles.monthEmpty}>Nenhum compromisso cadastrado neste mês.</Text>
          )}
        </View>
        <View style={styles.legend}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.legendRow, narrow && styles.legendRowNarrow]}>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, styles.dayToday]} /><Text style={[styles.legendText, narrow && styles.legendTextNarrow]}>Hoje</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendSwatch, styles.daySelected]} /><Text style={[styles.legendText, narrow && styles.legendTextNarrow]}>Selecionado</Text></View>
            <View style={styles.legendItem}><View style={[styles.dot, styles.dotOn]} /><Text style={[styles.legendText, narrow && styles.legendTextNarrow]}>Com eventos</Text></View>
            {!!dueIso && (
              <View style={styles.legendItem}><View style={[styles.legendSwatch, styles.dayDue]} /><Text style={[styles.legendText, narrow && styles.legendTextNarrow]}>Parto previsto</Text></View>
            )}
          </ScrollView>
        </View>

        {/* Sobre o dia selecionado: toca para ver os eventos dele */}
        <TouchableOpacity
          style={styles.about}
          onPress={() => setDayOpen(true)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`${aboutTitle}, ${dateLong(selected)}, ${plural(dayCount, 'evento', 'eventos')}. Ver eventos`}
        >
          <View style={styles.aboutHead}>
            <Text style={styles.aboutTitle}>{aboutTitle}</Text>
            <Icon name="fwd" color={colors.primary} size={16} />
          </View>
          <View style={styles.aboutRow}>
            <View style={styles.aboutLeft}>
              {selectedGestation && (
                <View style={styles.aboutPill}><Text style={styles.aboutPillText}>Dia {selectedGestation.days}</Text></View>
              )}
              <Text style={styles.aboutDate}>{dateLong(selected)}</Text>
              <Text style={styles.aboutCount}>{dayCount ? plural(dayCount, 'evento', 'eventos') : 'Sem eventos'}</Text>
            </View>
            {selectedGestation && (
              <>
                <View style={styles.aboutDivider} />
                <View style={styles.aboutRight}>
                  <View style={styles.aboutIcon}>
                    <Icon name="cal" color={colors.primary} size={17} />
                  </View>
                  <View>
                    <Text style={styles.aboutWeeks}>{plural(selectedGestation.weeks, 'semana', 'semanas')}</Text>
                    <Text style={styles.aboutWeeksSub}>de gestação</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Painel inferior: eventos do dia, ou os detalhes de um deles */}
      <Modal visible={dayOpen || !!detail} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={styles.backdrop} onPress={closeSheet} accessibilityLabel="Fechar" />
        <View style={styles.sheet}>
          {detail ? (
            <>
              <View style={styles.sheetTop}>
                {dayOpen && (
                  <TouchableOpacity
                    onPress={() => setDetailKey(null)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Voltar aos eventos do dia"
                  >
                    <Icon name="back" color={colors.black} size={22} />
                  </TouchableOpacity>
                )}
                <View style={styles.itemIcon}>
                  <Icon name={detail.icon} color={colors.primary} size={18} />
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={styles.sheetTitle}>{detail.title}</Text>
                  <View style={styles.tags}>
                    <View style={styles.tag}><Text style={styles.tagText}>{detail.tag}</Text></View>
                  </View>
                </View>
                <TouchableOpacity onPress={closeSheet} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Fechar">
                  <Icon name="x" color={colors.black} size={22} />
                </TouchableOpacity>
              </View>
              <View style={styles.details}>
                <DetailRow label="Data" value={isoToBr(detail.date)} />
                <DetailRow label="Horário" value={detail.time} />
                <DetailRow label="Local" value={detail.place} />
                <DetailRow label="Frequência" value={detail.freq} />
                <DetailRow label={detail.kind === 'event' ? 'Observações' : detail.kind === 'due' ? 'Gestação' : 'Descrição'} value={detail.notes} />
                {detail.kind === 'reminder' && <DetailRow label="Status" value={detail.done ? 'Concluído' : 'Ativo'} />}
              </View>
              {detail.kind === 'due' ? (
                <TouchableOpacity style={styles.sheetAction} onPress={openPersonalData} accessibilityRole="button">
                  <Icon name="edit" color={colors.black} size={16} />
                  <Text style={styles.sheetActionText}>Alterar em Dados Pessoais</Text>
                </TouchableOpacity>
              ) : detail.kind === 'event' ? (
                <TouchableOpacity style={styles.sheetAction} onPress={askDelete} accessibilityRole="button">
                  <Icon name="trash" color={colors.danger} size={16} />
                  <Text style={[styles.sheetActionText, { color: colors.danger }]}>Remover evento</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.sheetAction} onPress={openReminders} accessibilityRole="button">
                  <Icon name="bell" color={colors.black} size={16} />
                  <Text style={styles.sheetActionText}>Abrir em Lembretes</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <View style={styles.sheetTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetTitle}>{showAll ? 'Todos os eventos' : 'Eventos do dia'}</Text>
                  {!showAll && <Text style={styles.sheetSub}>{dateLong(selected)}</Text>}
                </View>
                <TouchableOpacity
                  onPress={() => setShowAll(v => !v)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityRole="button"
                >
                  <Text style={styles.sectionLink}>{showAll ? 'Ver só o dia' : 'Ver todos'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeSheet} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} accessibilityLabel="Fechar">
                  <Icon name="x" color={colors.black} size={22} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
                {shown.length === 0 ? (
                  <View style={styles.empty}>
                    <View style={styles.itemIcon}>
                      <Icon name="cal" color={colors.primary} size={18} />
                    </View>
                    <Text style={styles.emptyText}>
                      {showAll ? 'Você ainda não tem eventos cadastrados.' : 'Você não tem eventos para este dia.'}
                    </Text>
                  </View>
                ) : (
                  shown.map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={styles.item}
                      onPress={() => setDetailKey(item.key)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.title}, ${item.tag}`}
                    >
                      <View style={styles.itemIcon}>
                        <Icon name={item.icon} color={colors.primary} size={18} />
                      </View>
                      <View style={styles.itemMain}>
                        <Text style={[styles.itemTitle, item.done && styles.itemTitleDone]}>{item.title}</Text>
                        <Text style={styles.itemInfo}>
                          {[showAll ? isoToBr(item.date) : null, item.kind === 'due' ? item.notes : item.time || 'Sem horário', item.place].filter(Boolean).join(' · ')}
                        </Text>
                        <View style={styles.tags}>
                          <View style={styles.tag}><Text style={styles.tagText}>{item.tag}</Text></View>
                          {item.done && (
                            <View style={[styles.tag, styles.tagDone]}>
                              <Icon name="check" color={colors.success} size={11} />
                              <Text style={[styles.tagText, styles.tagTextDone]}>Concluído</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Icon name="fwd" color={colors.grayLight} size={16} />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </>
          )}
        </View>
      </Modal>

      <ConfirmDialog
        visible={!!deleting}
        icon="trash"
        title="Remover evento?"
        message={deleting ? `“${deleting.title}” será removido do calendário.` : ''}
        confirmLabel="Remover"
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: fonts.extraBold, color: colors.black },
  body: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 20 },

  summary: {
    backgroundColor: colors.primaryPale, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, gap: 12,
    marginTop: -24, // sobe o card do resumo; o calendário compensa abaixo e fica onde estava
  },
  summaryRow:     { flexDirection: 'row', alignItems: 'center', gap: 14 },
  summaryCol:     { flex: 1 },
  progressBg:     { height: 6, borderRadius: 3, backgroundColor: 'rgba(218,29,107,0.16)', overflow: 'hidden' },
  progressBar:    { height: '100%', borderRadius: 3, backgroundColor: colors.primary },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 5 },
  progressText:   { fontSize: 12, lineHeight: 15, fontFamily: fonts.medium, color: colors.blackSoft },
  summaryLabel:   { fontSize: 12, lineHeight: 15, fontFamily: fonts.regular, color: colors.blackSoft },
  summaryValue:   { fontSize: 20, lineHeight: 25, fontFamily: fonts.bold, color: colors.primary },
  summaryLink:    { fontSize: 13, lineHeight: 17, fontFamily: fonts.bold, color: colors.primary, marginTop: 2 },
  summaryDivider: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(218,29,107,0.18)' },
  summaryTitle:   { fontSize: 17, lineHeight: 21, fontFamily: fonts.bold, color: colors.ink },
  summarySub:     { fontSize: 12, lineHeight: 15, fontFamily: fonts.medium, color: colors.blackSoft, marginTop: 1 },

  calendar: {
    backgroundColor: colors.white, borderRadius: 16,
    paddingTop: 4, paddingBottom: 4, marginTop: 50,
  },
  monthRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthTitle: { fontSize: 16, fontFamily: fonts.bold, color: colors.ink },
  grid:       { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: {
    width: `${100 / 7}%`, textAlign: 'center', paddingVertical: 6,
    fontSize: 11, fontFamily: fonts.semiBold, color: colors.gray,
  },
  cell: { width: `${100 / 7}%`, height: 38, alignItems: 'center', justifyContent: 'center', gap: 1 },
  day:  { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  // hoje: anel rosa · selecionado: rosa bem claro · parto previsto: rosa forte · com eventos: ponto
  daySelected:     { backgroundColor: 'rgba(218,29,107,0.16)' },
  dayToday:        { borderWidth: 1.5, borderColor: colors.primary },
  dayDue:          { backgroundColor: colors.primary, borderWidth: 0 },
  // A League Spartan desenha os números acima do meio da linha; o paddingTop
  // desce o texto 1,5px para ele ficar no centro do círculo.
  dayText:         { fontSize: 14, fontFamily: fonts.medium, color: colors.ink, paddingTop: 3 },
  dayTextAccent:   { fontFamily: fonts.bold, color: colors.primary },
  dayTextDue:      { fontFamily: fonts.bold, color: colors.white },
  dot:   { width: 5, height: 5, borderRadius: 3, backgroundColor: 'transparent' },
  dotOn: { backgroundColor: colors.primary },
  legend: {
    backgroundColor: colors.primaryPale, borderRadius: 14, marginTop: 10, overflow: 'hidden',
  },
  legendRow: { flexGrow: 1, flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 7 },
  // em telas estreitas a legenda aperta um pouco para continuar inteira numa linha
  legendRowNarrow:  { gap: 6, paddingHorizontal: 6 },
  legendTextNarrow: { fontSize: 10 },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 12, height: 12, borderRadius: 6 },
  legendText:   { fontSize: 11, fontFamily: fonts.medium, color: colors.blackSoft },
  monthEmpty: { fontSize: 12, fontFamily: fonts.regular, color: colors.gray, textAlign: 'center', marginTop: 8 },

  sectionLink:  { fontSize: 13, fontFamily: fonts.semiBold, color: colors.primary },

  about:      { backgroundColor: colors.primaryPale, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, gap: 10, marginTop: 54 },
  aboutHead:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aboutTitle: { fontSize: 15, fontFamily: fonts.bold, color: colors.primary },
  aboutRow:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  // barra rosa à esquerda, como na referência
  aboutLeft:  { flex: 1, borderLeftWidth: 2, borderLeftColor: colors.primary, paddingLeft: 10, gap: 3, alignItems: 'flex-start' },
  aboutPill:  { backgroundColor: 'rgba(218,29,107,0.14)', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 2 },
  aboutPillText: { fontSize: 11, fontFamily: fonts.semiBold, color: colors.primary },
  aboutDate:  { fontSize: 13, lineHeight: 17, fontFamily: fonts.medium, color: colors.ink },
  aboutCount: { fontSize: 12, lineHeight: 15, fontFamily: fonts.regular, color: colors.blackSoft },
  aboutDivider: { width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(218,29,107,0.18)' },
  aboutRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aboutIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(218,29,107,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  aboutWeeks:    { fontSize: 15, lineHeight: 19, fontFamily: fonts.bold, color: colors.ink },
  aboutWeeksSub: { fontSize: 12, lineHeight: 15, fontFamily: fonts.regular, color: colors.gray },

  item: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 16,
    padding: 12, marginTop: 10,
  },
  itemIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
  },
  itemMain:      { flex: 1, gap: 4, alignItems: 'flex-start' },
  itemTitle:     { fontSize: 15, lineHeight: 19, fontFamily: fonts.bold, color: colors.ink },
  itemTitleDone: { color: colors.gray, textDecorationLine: 'line-through' },
  itemInfo:      { fontSize: 12, lineHeight: 16, fontFamily: fonts.regular, color: colors.gray },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryPale, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3,
  },
  tagDone:     { backgroundColor: colors.successSoft },
  tagText:     { fontSize: 11, fontFamily: fonts.semiBold, color: colors.primary },
  tagTextDone: { color: colors.success },
  empty: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10,
    borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 12,
  },
  emptyText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: fonts.regular, color: colors.gray },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center',
    backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24,
  },
  sheetTop:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sheetSub:   { fontSize: 13, lineHeight: 17, fontFamily: fonts.regular, color: colors.gray, marginTop: 2 },
  sheetList:  { maxHeight: 360, marginTop: 4 },
  sheetTitle: { fontSize: 18, lineHeight: 22, fontFamily: fonts.bold, color: colors.ink },
  details:    { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.line },
  detailRow: {
    flexDirection: 'row', gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  detailLabel: { width: 96, fontSize: 13, fontFamily: fonts.semiBold, color: colors.gray },
  detailValue: { flex: 1, fontSize: 14, lineHeight: 19, fontFamily: fonts.regular, color: colors.ink },
  sheetAction: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 38, borderRadius: 19, backgroundColor: colors.grayBg, marginTop: 16,
  },
  sheetActionText: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.black },
})
