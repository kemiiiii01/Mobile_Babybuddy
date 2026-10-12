import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { Copyright } from '../components/Copyright'
import { SelectField } from '../components/SelectField'
import { CalendarModal } from '../components/DateTimeFields'
import { brToIso, isoToBr, maskDate, todayIso } from '../constants/gestation'
import { colors, fonts, radius } from '../theme'
import { obterGestanteDoUsuario, registrarOuAtualizarGestante } from '../application/gestante'

const range = (from, to, unit) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ value: String(from + i), label: `${from + i} ${unit}` }))

const WEIGHTS = range(1, 150, 'kg')
const HEIGHTS = range(100, 220, 'cm')
const WEEKS = Array.from({ length: 42 }, (_, i) => ({ value: String(i + 1), label: i === 0 ? '1 semana' : (i + 1) + ' semanas' }))
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => ({ value: t, label: t }))

export default function PersonalDataScreen({ navigation }) {
  const { currentUser, profile, setProfile } = useApp()
  const [form, setForm] = useState({ ...profile, name: profile.name || currentUser?.nome || '' })
  const [saved, setSaved] = useState(false)
  const [gestanteId, setGestanteId] = useState(null)
  // O formulário guarda as datas em AAAA-MM-DD. Enquanto a pessoa digita, o texto
  // (DD/MM/AAAA, talvez incompleto) fica aqui; undefined = mostrar a data já salva.
  const [typed, setTyped] = useState({})
  const [dateErrors, setDateErrors] = useState({})
  const [calendarFor, setCalendarFor] = useState(null)

  // Se já existe um cadastro de Gestante para este usuário no backend, usa o
  // tipo sanguíneo/data de nascimento de lá em vez do que sobrou no AsyncStorage local.
  useEffect(() => {
    if (!currentUser?.id) return
    let ativo = true
    obterGestanteDoUsuario(currentUser.id)
      .then(gestante => {
        if (!ativo || !gestante) return
        setGestanteId(gestante.id)
        setForm(prev => ({
          ...prev,
          blood: gestante.blood || prev.blood,
          birthDate: gestante.birthDate || prev.birthDate,
        }))
      })
      .catch(() => {})
    return () => { ativo = false }
  }, [currentUser?.id])

  function handleSave() {
    const errors = {}
    for (const key of ['birthDate', 'due']) {
      if (typed[key] && !brToIso(typed[key])) errors[key] = 'Data inválida. Use o formato DD/MM/AAAA.'
    }
    setDateErrors(errors)
    if (Object.keys(errors).length) return

    setProfile(form)
    setSaved(true)
    // Persiste no backend só quando os campos obrigatórios de Gestante estão
    // preenchidos; não bloqueia o "Salvo!" local, que continua imediato.
    if (currentUser?.id && form.blood && form.birthDate) {
      registrarOuAtualizarGestante(currentUser.id, gestanteId, form)
        .then(gestante => setGestanteId(gestante.id))
        .catch(() => {})
    }
    setTimeout(() => navigation.goBack(), 600)
  }

  const set = key => value => setForm(p => ({ ...p, [key]: value }))

  function typeDate(key, text) {
    const masked = maskDate(text)
    setTyped(t => ({ ...t, [key]: masked }))
    setDateErrors(e => ({ ...e, [key]: '' }))
    // só entra no formulário quando vira uma data completa e real; vazio limpa o campo
    setForm(p => ({ ...p, [key]: brToIso(masked) || '' }))
  }

  function pickDate(key, iso) {
    setTyped(t => ({ ...t, [key]: undefined }))
    setDateErrors(e => ({ ...e, [key]: '' }))
    setForm(p => ({ ...p, [key]: iso }))
  }

  function dateField(key, label) {
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.input, styles.dateRow, !!dateErrors[key] && styles.inputErr]}>
          <TextInput
            style={styles.dateInput}
            placeholder="00/00/0000"
            placeholderTextColor={colors.gray}
            value={typed[key] ?? isoToBr(form[key])}
            onChangeText={text => typeDate(key, text)}
            keyboardType="number-pad"
            maxLength={10}
            accessibilityLabel={label}
          />
          <TouchableOpacity
            onPress={() => setCalendarFor(key)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={`Abrir calendário: ${label}`}
          >
            <Icon name="cal" color={colors.black} size={18} />
          </TouchableOpacity>
        </View>
        {!!dateErrors[key] && <Text style={styles.errText}>{dateErrors[key]}</Text>}
      </View>
    )
  }

  function field(key, label, placeholder, keyboard = 'default') {
    return (
      <View>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.gray}
          value={form[key] || ''}
          onChangeText={set(key)}
          keyboardType={keyboard}
          autoCapitalize={keyboard === 'default' ? 'words' : 'none'}
          accessibilityLabel={label}
        />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.grayBg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="back" color={colors.black} size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dados Pessoais</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {field('name', 'Nome completo', 'Seu nome completo')}
          {dateField('birthDate', 'Data de nascimento')}
          <SelectField label="Peso" placeholder="Selecione seu peso" options={WEIGHTS} startAt="60" value={form.weight} onChange={set('weight')} />
          <SelectField label="Altura" placeholder="Selecione sua altura" options={HEIGHTS} startAt="160" value={form.height} onChange={set('height')} />
          <SelectField label="Tipo sanguíneo" placeholder="Selecione seu tipo sanguíneo" options={BLOOD_TYPES} value={form.blood} onChange={set('blood')} />
          <SelectField label="Semanas de gestação" placeholder="Selecione a semana" options={WEEKS} value={form.weeks} onChange={set('weeks')} />
          {dateField('due', 'Data prevista para o parto')}
          {field('hospital', 'Hospital / Maternidade', 'Nome do local')}
          {field('doctor', 'Médico(a)', 'Nome do(a) médico(a)')}
          {field('allergies', 'Alergias', 'Ex: Dipirona')}

          <TouchableOpacity
            style={[styles.saveBtn, saved && { backgroundColor: colors.success }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Icon name={saved ? 'check' : 'ok'} color={colors.white} size={18} />
            <Text style={styles.saveBtnText}>{saved ? 'Salvo!' : 'Salvar Dados'}</Text>
          </TouchableOpacity>
          <Copyright />
        </ScrollView>
      </KeyboardAvoidingView>

      <CalendarModal
        visible={!!calendarFor}
        value={calendarFor ? form[calendarFor] : ''}
        // sem data ainda: nascimento abre uns 28 anos atrás, parto abre no mês atual
        startAt={calendarFor === 'birthDate' ? `${Number(todayIso().slice(0, 4)) - 28}-01-01` : undefined}
        onPick={iso => pickDate(calendarFor, iso)}
        onClose={() => setCalendarFor(null)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.grayBg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: fonts.extraBold, color: colors.black },
  body: { flexGrow: 1, padding: 20, gap: 14, paddingBottom: 20 },
  label: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.black, marginBottom: 3 },
  input: {
    height: 44, backgroundColor: colors.white,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
    borderRadius: radius.input, paddingHorizontal: 14, paddingVertical: 0,
    fontSize: 15, color: colors.black, fontFamily: fonts.regular,
  },
  dateRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateInput: {
    flex: 1, minWidth: 0, height: '100%', padding: 0,
    fontSize: 15, color: colors.black, fontFamily: fonts.regular,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  inputErr: { borderWidth: 1, borderColor: colors.danger },
  errText:  { fontSize: 12, color: colors.danger, fontFamily: fonts.semiBold, marginTop: 5, paddingLeft: 2 },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 25,
    paddingVertical: 11, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10,
  },
  saveBtnText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 15 },
})
