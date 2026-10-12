import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Switch,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { DateField, TimeField } from '../components/DateTimeFields'
import { colors, fonts, radius } from '../theme'
import { REMINDER_CATEGORIES, REMINDER_COLORS, REMINDER_FREQUENCIES, reminderColor } from '../constants/reminders'

const TITLE_MAX = 25
// O servidor guarda a descrição em um campo de 200 caracteres.
const NOTES_MAX = 180

export default function AddReminderScreen({ navigation, route }) {
  const { reminders, addReminder, deleteReminder } = useApp()
  const editing = reminders.find(r => r.id === route?.params?.reminderId) || null

  const [title, setTitle]   = useState(editing?.title || '')
  const [cat, setCat]       = useState(editing?.cat || '')
  const [date, setDate]     = useState(editing?.date || '')
  const [time, setTime]     = useState(editing?.time || '')
  const [freq, setFreq]     = useState(editing?.freq || 'Uma vez')
  const [notes, setNotes]   = useState(editing?.notes || '')
  const [notify, setNotify] = useState(editing?.notify || false)
  const [color, setColor]   = useState(reminderColor(editing?.color))
  const [errors, setErrors] = useState({})

  const showFreq = cat === 'Medicamento'

  function clearError(key) {
    setErrors(e => (e[key] ? { ...e, [key]: '' } : e))
  }

  function validate() {
    const next = {}
    if (!title.trim()) next.title = 'Digite um título.'
    if (!cat) next.cat = 'Selecione uma categoria.'
    if (!date) next.date = 'Selecione a data.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSave() {
    if (!validate()) return
    const reminder = {
      id: editing?.id || Date.now().toString(),
      title: title.trim(),
      cat, date, time, notify, color,
      // a frequência só existe para medicamentos
      freq: showFreq ? freq : 'Uma vez',
      notes: notes.trim(),
      done: editing?.done || false,
    }
    // O contexto só sabe criar e remover: a edição troca o registro antigo pelo novo,
    // e com isso o compromisso no servidor também é recriado.
    if (editing) deleteReminder(editing.id)
    addReminder(reminder)
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
            <Icon name="back" color={colors.black} size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editing ? 'Editar lembrete' : 'Novo lembrete'}</Text>
          <View style={styles.headerBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Título do lembrete</Text>
          <TextInput
            style={[styles.input, !!errors.title && styles.inputErr]}
            placeholder="Ex.: Tomar o suplemento"
            placeholderTextColor={colors.grayLight}
            value={title}
            onChangeText={v => { setTitle(v); clearError('title') }}
            maxLength={TITLE_MAX}
            accessibilityLabel="Título do lembrete"
          />
          {!!errors.title && <Text style={styles.errText}>{errors.title}</Text>}

          <Text style={[styles.label, styles.gap]}>Categoria</Text>
          <View style={styles.cats}>
            {REMINDER_CATEGORIES.map(c => {
              const active = cat === c.value
              return (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.cat, active && styles.catActive]}
                  onPress={() => { setCat(c.value); clearError('cat') }}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={c.label}
                >
                  <View style={styles.catIcon}>
                    <Icon name={c.icon} color={colors.primary} size={15} />
                  </View>
                  <Text style={styles.catText} numberOfLines={1}>{c.label}</Text>
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>

          {!!errors.cat && <Text style={styles.errText}>{errors.cat}</Text>}

          <View style={[styles.row, styles.gap]}>
            <DateField label="Data" value={date} error={!!errors.date} disablePast onChange={v => { setDate(v); clearError('date') }} />
            <TimeField label="Horário (opcional)" value={time} onChange={setTime} />
          </View>
          {!!errors.date && <Text style={styles.errText}>{errors.date}</Text>}

          {showFreq && <>
          <Text style={[styles.label, styles.gap]}>Frequência</Text>
          <View style={styles.chips}>
            {REMINDER_FREQUENCIES.map(f => {
              const active = freq === f
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFreq(f)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          </>}

          <View style={[styles.labelRow, styles.gap]}>
            <Text style={styles.label}>Descrição (opcional)</Text>
            <Text style={styles.counter}>{notes.length}/{NOTES_MAX}</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Adicione mais detalhes sobre o lembrete..."
            placeholderTextColor={colors.grayLight}
            value={notes}
            onChangeText={setNotes}
            multiline
            maxLength={NOTES_MAX}
            textAlignVertical="top"
            accessibilityLabel="Descrição"
          />

          <Text style={[styles.label, styles.gap]}>Cor do lembrete</Text>
          <View style={styles.colors}>
            {REMINDER_COLORS.map(c => {
              const active = color === c.value
              return (
                <TouchableOpacity
                  key={c.value}
                  style={[styles.colorRing, active && { borderColor: c.value }]}
                  onPress={() => setColor(c.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={c.label}
                >
                  <View style={[styles.colorDot, { backgroundColor: c.value }]}>
                    {active && <Icon name="check" color={colors.white} size={14} />}
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={[styles.notify, styles.gap]}>
            <View style={styles.catIcon}>
              <Icon name="bell" color={colors.primary} size={15} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.notifyTitle}>Receber notificação</Text>
              <Text style={styles.notifyText}>Ative para receber um aviso no horário do lembrete.</Text>
            </View>
            <Switch
              value={notify}
              onValueChange={setNotify}
              trackColor={{ false: colors.line, true: colors.primarySoft }}
              thumbColor={notify ? colors.primary : colors.white}
              {...Platform.select({ web: { activeThumbColor: colors.primary } })}
              accessibilityLabel="Receber notificação"
            />
          </View>


          <View style={styles.footer}>
            <TouchableOpacity style={[styles.footerBtn, styles.cancelBtn]} onPress={() => navigation.goBack()} accessibilityRole="button">
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.footerBtn, styles.saveBtn]} onPress={handleSave} activeOpacity={0.85} accessibilityRole="button">
              <Text style={styles.saveText}>Salvar lembrete</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

      </KeyboardAvoidingView>
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
  body: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 },
  label:    { fontSize: 14, fontFamily: fonts.semiBold, color: colors.inkSoft, marginBottom: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  counter:  { fontSize: 12, fontFamily: fonts.regular, color: colors.gray },
  gap:      { marginTop: 22 },
  row:      { flexDirection: 'row', gap: 12 },
  input: {
    height: 46, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line,
    borderRadius: radius.input, paddingHorizontal: 14, paddingVertical: 0,
    fontSize: 15, color: colors.ink, fontFamily: fonts.regular,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  inputErr: { borderColor: colors.danger },
  textarea: { height: 84, paddingTop: 12, paddingBottom: 12 },
  errText:  { fontSize: 12, color: colors.danger, fontFamily: fonts.semiBold, marginTop: 5, paddingLeft: 2 },

  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cat: {
    flexBasis: '47%', flexGrow: 1, minWidth: 160, flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.white,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  catActive: { backgroundColor: colors.primaryPale, borderColor: colors.primary },
  catIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(218,29,107,0.14)',
    alignItems: 'center', justifyContent: 'center',
  },
  catText: { flex: 1, fontSize: 13, fontFamily: fonts.semiBold, color: colors.ink },
  radio: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.grayLight,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    height: 28, paddingHorizontal: 12, borderRadius: 14, justifyContent: 'center',
    borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white,
  },
  chipActive:     { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText:       { fontSize: 12, fontFamily: fonts.semiBold, color: colors.gray },
  chipTextActive: { color: colors.white },

  notify: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.primaryPale, borderRadius: 14, padding: 12,
  },
  notifyTitle: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.ink },
  notifyText:  { fontSize: 12, lineHeight: 15, fontFamily: fonts.regular, color: colors.blackSoft, marginTop: 2 },

  colors: { flexDirection: 'row', gap: 12 },
  colorRing: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'transparent',
    alignItems: 'center', justifyContent: 'center',
  },
  colorDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },

  footer: { flexDirection: 'row', gap: 12, marginTop: 28 },
  footerBtn:  { flex: 1, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  cancelBtn:  { borderWidth: 1.5, borderColor: colors.primary },
  cancelText: { fontSize: 14, fontFamily: fonts.bold, color: colors.primary },
  saveBtn:    { backgroundColor: colors.primary },
  saveText:   { fontSize: 14, fontFamily: fonts.bold, color: colors.white },
})
