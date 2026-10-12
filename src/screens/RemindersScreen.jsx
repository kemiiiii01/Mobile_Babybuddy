import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { colors, fonts, layout } from '../theme'
import { isoToBr, reminderCategory, reminderColor, reminderInfo } from '../constants/reminders'

const FILTERS = ['Todos', 'Ativos', 'Concluídos']

function StatusBadge({ done }) {
  return (
    <View style={[styles.status, done && styles.statusDone]}>
      {done && <Icon name="check" color={colors.success} size={11} />}
      <Text style={[styles.statusText, done && styles.statusTextDone]}>{done ? 'Concluído' : 'Ativo'}</Text>
    </View>
  )
}

function CategoryTag({ label }) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  )
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

export default function RemindersScreen({ navigation }) {
  const { reminders, deleteReminder, toggleReminder, remFilter, setRemFilter } = useApp()
  const [detailId, setDetailId] = useState(null)
  const [deleting, setDeleting] = useState(null)

  // O filtro salvo antes era por categoria; qualquer valor fora da lista vira "Todos".
  const filter = FILTERS.includes(remFilter) ? remFilter : 'Todos'
  const counts = {
    Todos: reminders.length,
    Ativos: reminders.filter(r => !r.done).length,
    Concluídos: reminders.filter(r => r.done).length,
  }
  const filtered = filter === 'Todos' ? reminders
    : reminders.filter(r => (filter === 'Concluídos' ? r.done : !r.done))

  const detail = reminders.find(r => r.id === detailId) || null
  const detailCat = detail && reminderCategory(detail.cat)

  function editDetail() {
    const id = detail.id
    setDetailId(null)
    navigation.navigate('AddReminder', { reminderId: id })
  }

  function askDelete() {
    // Fecha o painel antes de abrir a confirmação, para não empilhar dois modais.
    setDeleting(detail)
    setDetailId(null)
  }

  function confirmDelete() {
    deleteReminder(deleting.id)
    setDeleting(null)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
          <Icon name="back" color={colors.black} size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lembretes</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate('Notifications')}
          accessibilityLabel="Notificações"
        >
          <Icon name="bell" color={colors.black} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <Text style={styles.title} accessibilityRole="header">Lembretes</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('AddReminder')}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Icon name="plus" color={colors.white} size={14} />
            <Text style={styles.newBtnText}>Novo lembrete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Icon name="bell" color={colors.primary} size={18} />
          </View>
          <Text style={styles.infoText}>
            Os lembretes ajudam você a cuidar de você e do seu bebê em cada etapa.
          </Text>
        </View>

        <View style={styles.filters}>
          {FILTERS.map(f => {
            const active = filter === f
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filter, active && styles.filterActive]}
                onPress={() => setRemFilter(f)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]} numberOfLines={1}>
                  {f} ({counts[f]})
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Icon name="bell" color={colors.primary} size={24} />
            </View>
            <Text style={styles.emptyTitle}>
              {reminders.length === 0 ? 'Nenhum lembrete por aqui'
                : filter === 'Concluídos' ? 'Nenhum lembrete concluído' : 'Nenhum lembrete ativo'}
            </Text>
            <Text style={styles.emptySub}>
              {reminders.length === 0
                ? 'Toque em “Novo lembrete” para criar o primeiro.'
                : 'Troque o filtro para ver os demais lembretes.'}
            </Text>
          </View>
        ) : (
          filtered.map(r => {
            const cat = reminderCategory(r.cat)
            const info = reminderInfo(r)
            return (
              <TouchableOpacity
                key={r.id}
                style={styles.card}
                onPress={() => setDetailId(r.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${r.title}, ${cat.label}, ${r.done ? 'concluído' : 'ativo'}`}
              >
                <View style={[styles.cardBar, { backgroundColor: reminderColor(r.color) }]} />
                <View style={styles.cardIcon}>
                  <Icon name={cat.icon} color={colors.primary} size={20} />
                </View>
                <View style={styles.cardMain}>
                  <Text style={[styles.cardTitle, r.done && styles.cardTitleDone]}>{r.title}</Text>
                  {!!info && <Text style={styles.cardInfo}>{info}</Text>}
                  <CategoryTag label={cat.label} />
                </View>
                <View style={styles.cardSide}>
                  <StatusBadge done={r.done} />
                  <Icon name="fwd" color={colors.grayLight} size={16} />
                </View>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      {/* Detalhes do lembrete */}
      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetailId(null)}>
        <Pressable style={styles.backdrop} onPress={() => setDetailId(null)} accessibilityLabel="Fechar" />
        {detail && (
          <View style={styles.sheet}>
            <View style={styles.sheetTop}>
              <View style={styles.cardIcon}>
                <Icon name={detailCat.icon} color={colors.primary} size={20} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.sheetTitle}>{detail.title}</Text>
                <View style={styles.sheetTags}>
                  <CategoryTag label={detailCat.label} />
                  <StatusBadge done={detail.done} />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setDetailId(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Fechar"
              >
                <Icon name="x" color={colors.black} size={22} />
              </TouchableOpacity>
            </View>

            <View style={styles.details}>
              <DetailRow label="Data" value={isoToBr(detail.date)} />
              <DetailRow label="Horário" value={detail.time} />
              <DetailRow label="Frequência" value={detail.freq} />
              <DetailRow label="Descrição" value={detail.notes} />
              <DetailRow label="Notificação" value={detail.notify ? 'Ativada' : ''} />
              {!detail.date && !detail.time && !detail.freq && !detail.notes && (
                <Text style={styles.detailEmpty}>Sem informações adicionais.</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.sheetPrimary}
              onPress={() => toggleReminder(detail.id)}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Icon name="check" color={colors.white} size={16} />
              <Text style={styles.sheetPrimaryText}>
                {detail.done ? 'Marcar como ativo' : 'Marcar como concluído'}
              </Text>
            </TouchableOpacity>
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.sheetAction} onPress={editDetail} accessibilityRole="button">
                <Icon name="edit" color={colors.black} size={16} />
                <Text style={styles.sheetActionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetAction} onPress={askDelete} accessibilityRole="button">
                <Icon name="trash" color={colors.danger} size={16} />
                <Text style={[styles.sheetActionText, { color: colors.danger }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      <ConfirmDialog
        visible={!!deleting}
        icon="trash"
        title="Excluir lembrete?"
        message={deleting ? `“${deleting.title}” será removido da sua lista.` : ''}
        confirmLabel="Excluir"
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
  body: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },

  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title:    { flexShrink: 1, fontSize: 26, fontFamily: fonts.bold, color: colors.ink },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    height: 30, paddingHorizontal: 14, borderRadius: 15, backgroundColor: colors.primary,
  },
  newBtnText: { fontSize: 13, fontFamily: fonts.bold, color: colors.white },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.primaryPale, borderRadius: 16, padding: 12, marginTop: 14,
  },
  infoIcon: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(218,29,107,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 15, fontFamily: fonts.medium, color: colors.blackSoft },


  filters: { flexDirection: 'row', gap: 8, marginTop: 18, marginBottom: 12 },
  filter: {
    flex: 1, height: 30, borderRadius: 15, paddingHorizontal: 6,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.grayBg,
  },
  filterActive:     { backgroundColor: colors.primary },
  filterText:       { fontSize: 12, fontFamily: fonts.semiBold, color: colors.gray },
  filterTextActive: { color: colors.white },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 16,
    padding: 12, paddingLeft: 16, marginBottom: 10, overflow: 'hidden',
  },
  // faixa lateral discreta na cor escolhida para o lembrete
  cardBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  cardIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryPale,
    alignItems: 'center', justifyContent: 'center',
  },
  cardMain:      { flex: 1, gap: 4, alignItems: 'flex-start' },
  cardTitle:     { fontSize: 15, lineHeight: 19, fontFamily: fonts.bold, color: colors.ink },
  cardTitleDone: { color: colors.gray, textDecorationLine: 'line-through' },
  cardInfo:      { fontSize: 12, lineHeight: 16, fontFamily: fonts.regular, color: colors.gray },
  cardSide:      { alignItems: 'flex-end', gap: 10 },

  tag:     { backgroundColor: colors.primaryPale, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 },
  tagText: { fontSize: 11, fontFamily: fonts.semiBold, color: colors.primary },
  status: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.primaryPale, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3,
  },
  statusDone:     { backgroundColor: colors.successSoft },
  statusText:     { fontSize: 11, fontFamily: fonts.semiBold, color: colors.primary },
  statusTextDone: { color: colors.success },

  empty: {
    alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20, gap: 6,
    borderWidth: 1, borderColor: colors.line, borderRadius: 16,
  },
  emptyIcon: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: colors.primaryPale,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 15, fontFamily: fonts.bold, color: colors.ink, textAlign: 'center' },
  emptySub:   { fontSize: 13, lineHeight: 18, fontFamily: fonts.regular, color: colors.gray, textAlign: 'center' },

  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center',
    backgroundColor: colors.white, borderTopLeftRadius: 22, borderTopRightRadius: 22,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24,
  },
  sheetTop:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sheetTitle: { fontSize: 18, lineHeight: 22, fontFamily: fonts.bold, color: colors.ink },
  sheetTags:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  details:    { marginTop: 16, borderTopWidth: 1, borderTopColor: colors.line },
  detailRow: {
    flexDirection: 'row', gap: 12, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  detailLabel: { width: 88, fontSize: 13, fontFamily: fonts.semiBold, color: colors.gray },
  detailValue: { flex: 1, fontSize: 14, lineHeight: 19, fontFamily: fonts.regular, color: colors.ink },
  detailEmpty: { fontSize: 13, fontFamily: fonts.regular, color: colors.gray, paddingVertical: 12 },
  sheetPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 36, borderRadius: 18, backgroundColor: colors.primary, marginTop: 18,
  },
  sheetPrimaryText: { fontSize: 13, fontFamily: fonts.bold, color: colors.white },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  sheetAction: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 34, borderRadius: 17, backgroundColor: colors.grayBg,
  },
  sheetActionText: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.black },
})
