import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { Copyright } from '../components/Copyright'
import { colors, fonts, radius } from '../theme'

function validate(v) {
  if (!v) return 'Senha obrigatória'
  if (v.length < 8) return 'Mínimo de 8 caracteres'
  if (!/[a-z]/.test(v)) return 'Inclua ao menos uma letra minúscula'
  if (!/[A-Z]/.test(v)) return 'Inclua ao menos uma letra maiúscula'
  if (!/[0-9]/.test(v)) return 'Inclua ao menos um número'
  if (!/[^a-zA-Z0-9]/.test(v)) return 'Inclua ao menos um caractere especial'
  return ''
}

export default function ChangePasswordScreen({ navigation }) {
  const { changePassword } = useApp()
  const [newPass, setNewPass]       = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showNew, setShowNew]       = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [passErr, setPassErr]       = useState('')
  const [confErr, setConfErr]       = useState('')
  const [apiErr, setApiErr]         = useState('')
  const [loading, setLoading]       = useState(false)
  const [success, setSuccess]       = useState(false)

  async function handleSave() {
    const pErr = validate(newPass)
    setPassErr(pErr)
    const cErr = newPass !== confirm ? 'As senhas não coincidem' : ''
    setConfErr(cErr)
    if (pErr || cErr) return

    setLoading(true)
    setApiErr('')
    try {
      await changePassword(newPass)
      setSuccess(true)
      setTimeout(() => navigation.goBack(), 1200)
    } catch (err) {
      setApiErr(err.message || 'Erro ao alterar senha')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.grayBg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="back" color={colors.black} size={26} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alterar Senha</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {!!apiErr && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{apiErr}</Text>
            </View>
          )}

          <Text style={styles.label}>Nova senha</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, { flex: 1 }, passErr ? styles.inputErr : null]}
              placeholder="••••••••"
              placeholderTextColor={colors.blackSoft}
              value={newPass}
              onChangeText={v => { setNewPass(v); setPassErr('') }}
              secureTextEntry={!showNew}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowNew(s => !s)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={showNew ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <Icon name={showNew ? 'eyeOff' : 'eye'} color={colors.black} size={19} />
            </TouchableOpacity>
          </View>
          {!!passErr && <Text style={styles.errText}>{passErr}</Text>}

          <Text style={[styles.label, styles.labelGap]}>Confirmar nova senha</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, { flex: 1 }, confErr ? styles.inputErr : null]}
              placeholder="••••••••"
              placeholderTextColor={colors.blackSoft}
              value={confirm}
              onChangeText={v => { setConfirm(v); setConfErr('') }}
              secureTextEntry={!showConf}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowConf(s => !s)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={showConf ? 'Ocultar senha' : 'Mostrar senha'}
            >
              <Icon name={showConf ? 'eyeOff' : 'eye'} color={colors.black} size={19} />
            </TouchableOpacity>
          </View>
          {!!confErr && <Text style={styles.errText}>{confErr}</Text>}

          <TouchableOpacity
            style={[styles.saveBtn, (loading || success) && { backgroundColor: success ? colors.success : colors.primarySoft }]}
            onPress={handleSave}
            disabled={loading || success}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.saveBtnText}>{success ? 'Senha alterada!' : 'Salvar senha'}</Text>
            }
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
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.grayBg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontFamily: fonts.extraBold, color: colors.black },
  body: { flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 20 },
  errorBox: {
    backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.primarySoft,
    borderRadius: radius.input, padding: 12, marginBottom: 16,
  },
  errorBoxText: { fontSize: 13, color: colors.danger, fontFamily: fonts.semiBold },
  label: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.black, marginBottom: 3 },
  labelGap: { marginTop: 16 },
  passRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    height: 50, backgroundColor: colors.white,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1,
    borderRadius: radius.input, paddingLeft: 14, paddingRight: 46, paddingVertical: 0,
    fontSize: 15, color: colors.black, fontFamily: fonts.regular,
  },
  inputErr: { borderWidth: 1, borderColor: colors.danger },
  errText: { fontSize: 12, color: colors.danger, fontFamily: fonts.semiBold, marginTop: 5, paddingLeft: 2 },
  eyeBtn: { position: 'absolute', right: 14 },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: 25,
    paddingVertical: 11, minHeight: 42,
    alignItems: 'center', justifyContent: 'center', marginTop: 28,
  },
  saveBtnText: { color: colors.white, fontFamily: fonts.extraBold, fontSize: 15 },
})
