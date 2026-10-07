import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { Copyright } from '../components/Copyright'
import { colors, fonts, radius } from '../theme'

export default function AddEventScreen({ navigation }) {
  const { addEvent } = useApp()
  const [title, setTitle]   = useState('')
  const [date, setDate]     = useState('')
  const [time, setTime]     = useState('')
  const [local, setLocal]   = useState('')
  const [notes, setNotes]   = useState('')
  const [titleErr, setTitleErr] = useState('')

  function handleSave() {
    if (!title.trim()) { setTitleErr('Título obrigatório'); return }
    addEvent({
      id: Date.now().toString(),
      title: title.trim(),
      date: date.trim(),
      time: time.trim(),
      local: local.trim(),
      notes: notes.trim(),
    })
    navigation.goBack()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="back" color={colors.white} size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Evento</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>TÍTULO *</Text>
          <TextInput
            style={[styles.input, titleErr ? styles.inputErr : null]}
            placeholder="Ex: Consulta pré-natal"
            placeholderTextColor={colors.placeholder}
            value={title}
            onChangeText={v => { setTitle(v); setTitleErr('') }}
          />
          {!!titleErr && <Text style={styles.errText}>{titleErr}</Text>}

          <Text style={styles.label}>DATA (AAAA-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2026-06-20"
            placeholderTextColor={colors.placeholder}
            value={date}
            onChangeText={setDate}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>HORÁRIO</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 14:30"
            placeholderTextColor={colors.placeholder}
            value={time}
            onChangeText={setTime}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>LOCAL</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: UBS Centro"
            placeholderTextColor={colors.placeholder}
            value={local}
            onChangeText={setLocal}
          />

          <Text style={styles.label}>OBSERVAÇÕES</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Notas adicionais..."
            placeholderTextColor={colors.placeholder}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Icon name="check" color={colors.white} size={18} />
            <Text style={styles.saveBtnText}>Salvar Evento</Text>
          </TouchableOpacity>
          <Copyright />
        </ScrollView>
      </KeyboardAvoidingView>
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
  body: { padding: 20, gap: 8, paddingBottom: 40 },
  label: { fontSize: 10, fontFamily: fonts.extraBold, color: colors.textMuted, letterSpacing: 1, marginTop: 8 },
  input: {
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: radius.input, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 13, color: colors.text, fontFamily: fonts.regular,
  },
  inputErr: { borderColor: colors.danger },
  errText: { fontSize: 11, color: colors.danger, fontFamily: fonts.bold, paddingLeft: 6 },
  textarea: { height: 90, paddingTop: 12 },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 50,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20,
  },
  saveBtnText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 15 },
})
