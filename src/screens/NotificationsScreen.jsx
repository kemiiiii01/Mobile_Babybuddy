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

export default function NotificationsScreen({ navigation }) {
  const { reminders, events } = useApp()

  const upcoming = [
    ...reminders.filter(r => !r.done).map(r => ({
      id: `r_${r.id}`, type: 'reminder', title: r.title,
      subtitle: [r.time, fmtDate(r.date)].filter(Boolean).join(' · '),
      color: r.color || colors.primary, cat: r.cat,
    })),
    ...events.map(e => ({
      id: `e_${e.id}`, type: 'event', title: e.title,
      subtitle: [fmtDate(e.date), e.time].filter(Boolean).join(' · '),
      color: colors.primary, cat: 'Evento',
    })),
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="back" color={colors.white} size={20} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 20 }}>
        {upcoming.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="bell" color={colors.placeholder} size={40} />
            <Text style={styles.emptyTitle}>Sem notificações</Text>
            <Text style={styles.emptySub}>Seus lembretes e eventos aparecerão aqui</Text>
          </View>
        ) : (
          upcoming.map(item => (
            <View key={item.id} style={[styles.card, { borderLeftColor: item.color }]}>
              <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
                <Icon name={item.type === 'reminder' ? 'bell' : 'cal'} color={item.color} size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {!!item.subtitle && <Text style={styles.cardSub}>{item.subtitle}</Text>}
                <View style={styles.tag}>
                  <Text style={[styles.tagText, { color: item.color }]}>{item.cat}</Text>
                </View>
              </View>
            </View>
          ))
        )}
        <Copyright />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: fonts.extraBold, color: colors.white },
  empty: { alignItems: 'center', padding: 28, gap: 8 },
  emptyTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.textMuted },
  emptySub: { fontSize: 12, color: colors.placeholder, fontFamily: fonts.semiBold, textAlign: 'center' },
  card: {
    backgroundColor: colors.white, borderRadius: 18, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderLeftWidth: 4,
    shadowColor: colors.primary, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.text, marginBottom: 2 },
  cardSub: { fontSize: 11, color: colors.textMuted, fontFamily: fonts.semiBold, marginBottom: 4 },
  tag: { backgroundColor: colors.surface, borderRadius: 50, paddingHorizontal: 10, paddingVertical: 2, alignSelf: 'flex-start' },
  tagText: { fontSize: 10, fontFamily: fonts.extraBold },
})
