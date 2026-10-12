import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { colors, fonts } from '../theme'

const SWITCH_ON = '#34C759'
const SECTIONS = [
  { title: 'CALENDÁRIO', items: [{ key: 'calendar', label: 'Eventos/Lembretes' }] },
  { title: 'NOTIFICAÇÕES DO APP', items: [{ key: 'general', label: 'Geral' }, { key: 'custom', label: 'Personalizadas' }] },
]
const DEFAULTS = { calendar: true, general: true, custom: true }

export default function NotificationsScreen({ navigation }) {
  const { currentUser } = useApp()
  const [prefs, setPrefs] = useState(DEFAULTS)
  // As preferências ficam guardadas no aparelho, por conta.
  const storageKey = currentUser?.email ? `${currentUser.email}_notificationPrefs` : null

  useEffect(() => {
    if (!storageKey) return
    let active = true
    AsyncStorage.getItem(storageKey)
      .then(raw => { if (active && raw) setPrefs({ ...DEFAULTS, ...JSON.parse(raw) }) })
      .catch(() => {})
    return () => { active = false }
  }, [storageKey])

  function toggle(key, value) {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    if (storageKey) AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {})
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
          <Icon name="back" color={colors.black} size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} accessibilityRole="header">Notificações</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {SECTIONS.map(section => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.group}>
              {section.items.map(item => (
                <View key={item.key} style={styles.row}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Switch
                    value={prefs[item.key]}
                    onValueChange={value => toggle(item.key, value)}
                    trackColor={{ false: colors.line, true: SWITCH_ON }}
                    thumbColor={colors.white}
                    ios_backgroundColor={colors.line}
                    {...Platform.select({ web: { activeThumbColor: colors.white } })}
                    accessibilityLabel={item.label}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.grayBg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: fonts.extraBold, color: colors.black },
  body: { paddingTop: 20, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 12, fontFamily: fonts.medium, color: colors.gray, letterSpacing: 0.6,
    paddingHorizontal: 16, marginTop: 20, marginBottom: 8,
  },
  group: { backgroundColor: colors.white, paddingVertical: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: 48, paddingHorizontal: 16,
  },
  rowLabel: { fontSize: 15, fontFamily: fonts.medium, color: colors.black },
})
