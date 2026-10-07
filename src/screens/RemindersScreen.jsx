import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { Copyright } from '../components/Copyright'
import { colors, fonts } from '../theme'

function fmtDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const CATS = ['Todos', 'Medicamento', 'Consulta', 'Exame', 'Outro']

export default function RemindersScreen({ navigation }) {
  const { reminders, deleteReminder, toggleReminder, remFilter, setRemFilter } = useApp()
  const filtered = remFilter === 'Todos' ? reminders : reminders.filter(r => r.cat === remFilter)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Lembretes</Text>
          <TouchableOpacity style={styles.newBtn} onPress={() => navigation.navigate('AddReminder')}>
            <Icon name="plus" color={colors.white} size={14} />
            <Text style={styles.newBtnText}>Novo</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {CATS.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.chip, remFilter === c && styles.chipActive]}
                onPress={() => setRemFilter(c)}
              >
                <Text style={[styles.chipText, remFilter === c && { color: colors.primary }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 20 }}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="bell" color={colors.placeholder} size={36} />
            <Text style={styles.emptyTitle}>
              {remFilter !== 'Todos' ? `Nenhum lembrete em "${remFilter}"` : 'Nenhum lembrete'}
            </Text>
            <Text style={styles.emptySub}>Toque em "+ Novo" para criar</Text>
          </View>
        ) : (
          filtered.map(r => (
            <View key={r.id} style={[styles.remItem, { borderLeftColor: r.color, opacity: r.done ? 0.55 : 1 }]}>
              <TouchableOpacity
                style={[styles.checkbox, r.done && { backgroundColor: colors.success, borderColor: colors.success }]}
                onPress={() => toggleReminder(r.id)}
              >
                {r.done && <Icon name="check" color={colors.white} size={12} />}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[styles.remTitle, r.done && { textDecorationLine: 'line-through' }]}>{r.title}</Text>
                <Text style={styles.remMeta}>{[r.time, fmtDate(r.date)].filter(Boolean).join(' · ')}</Text>
                <View style={styles.catTag}>
                  <Text style={styles.catTagText}>{r.cat}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteReminder(r.id)}>
                <Icon name="trash" color={colors.danger} size={16} />
              </TouchableOpacity>
            </View>
          ))
        )}
        <Copyright />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontFamily: fonts.extraBold, color: colors.white },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  newBtnText: { color: colors.white, fontSize: 12, fontFamily: fonts.extraBold },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 50,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  chipActive: { backgroundColor: colors.white },
  chipText: { fontSize: 12, fontFamily: fonts.extraBold, color: 'rgba(255,255,255,0.9)' },
  empty: { alignItems: 'center', padding: 28, gap: 8 },
  emptyTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.textMuted },
  emptySub: { fontSize: 12, color: colors.placeholder, fontFamily: fonts.semiBold },
  remItem: {
    backgroundColor: colors.white, borderRadius: 18, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderLeftWidth: 4,
    shadowColor: colors.primary, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  remTitle: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.text, marginBottom: 2 },
  remMeta: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.semiBold, marginBottom: 4 },
  catTag: { backgroundColor: colors.surface, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 2, alignSelf: 'flex-start' },
  catTagText: { fontSize: 10, fontFamily: fonts.extraBold, color: colors.primary },
  deleteBtn: { backgroundColor: colors.dangerSoft, borderRadius: 12, padding: 8 },
})
