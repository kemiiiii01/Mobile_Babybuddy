import { forwardRef, useRef, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { Copyright } from '../components/Copyright'
import { colors, fonts, radius } from '../theme'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const PASS_RULES = [
  { label: 'Mínimo 8 caracteres',                 test: v => v.length >= 8 },
  { label: 'Uma letra maiúscula e uma minúscula', test: v => /[A-Z]/.test(v) && /[a-z]/.test(v) },
  { label: 'Um número e um caractere especial',   test: v => /[0-9]/.test(v) && /[^a-zA-Z0-9]/.test(v) },
]

function formatarTelefone(valor) {
  const d = valor.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  const ddd = d.slice(0, 2), resto = d.slice(2)
  if (resto.length <= 4) return `(${ddd}) ${resto}`
  const corte = resto.length > 8 ? 5 : 4
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`
}

const Field = forwardRef(function Field({ label, icon, error, secure, style, onFocusChange, ...inputProps }, ref) {
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(false)

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.fieldFocus, !!error && styles.fieldErr]}>
        <Icon name={icon} color={focused ? colors.primary : colors.gray} size={18} />
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={colors.grayLight}
          onFocus={() => { setFocused(true); onFocusChange?.(true) }}
          onBlur={() => { setFocused(false); onFocusChange?.(false) }}
          secureTextEntry={secure && !visible}
          accessibilityLabel={label}
          {...inputProps}
        />
        {secure && (
          <TouchableOpacity
            onPress={() => setVisible(v => !v)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
          >
            <Icon name={visible ? 'eyeOff' : 'eye'} color={colors.gray} size={19} />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errText}>{error}</Text>}
    </View>
  )
})

export default function RegisterScreen({ navigation }) {
  const { register, authLoading, authError, setAuthError } = useApp()

  const [nome, setNome]         = useState('')
  const [email, setEmail]       = useState('')
  const [telefone, setTelefone] = useState('')
  const [pass, setPass]         = useState('')
  const [confirm, setConfirm]   = useState('')
  const [aceito, setAceito]     = useState(false)

  const [nomeErr, setNomeErr]     = useState('')
  const [emailErr, setEmailErr]   = useState('')
  const [passErr, setPassErr]     = useState('')
  const [confErr, setConfErr]     = useState('')
  const [aceitoErr, setAceitoErr] = useState('')

  const emailRef = useRef(null)
  const telRef   = useRef(null)
  const passRef  = useRef(null)
  const confRef  = useRef(null)

  const [passFocused, setPassFocused] = useState(false)
  const passChecks = PASS_RULES.map(r => r.test(pass))
  const showPassRules = passFocused || (pass.length > 0 && passChecks.includes(false))

  function validateAll() {
    let ok = true

    if (!nome.trim()) {
      setNomeErr('Nome obrigatório'); ok = false
    } else setNomeErr('')

    if (!email.trim()) {
      setEmailErr('E-mail obrigatório'); ok = false
    } else if (!EMAIL_RE.test(email)) {
      setEmailErr('Formato inválido (ex: nome@email.com)'); ok = false
    } else setEmailErr('')

    if (!pass) {
      setPassErr('Senha obrigatória'); ok = false
    } else if (pass.length < 8) {
      setPassErr('Mínimo de 8 caracteres'); ok = false
    } else if (!/[a-z]/.test(pass)) {
      setPassErr('Inclua ao menos uma letra minúscula'); ok = false
    } else if (!/[A-Z]/.test(pass)) {
      setPassErr('Inclua ao menos uma letra maiúscula'); ok = false
    } else if (!/[0-9]/.test(pass)) {
      setPassErr('Inclua ao menos um número'); ok = false
    } else if (!/[^a-zA-Z0-9]/.test(pass)) {
      setPassErr('Inclua ao menos um caractere especial'); ok = false
    } else setPassErr('')

    if (pass !== confirm) {
      setConfErr('As senhas não coincidem'); ok = false
    } else setConfErr('')

    if (!aceito) {
      setAceitoErr('Aceite os termos para continuar.'); ok = false
    } else setAceitoErr('')

    return ok
  }

  async function handleRegister() {
    setAuthError('')
    if (!validateAll()) return

    // Remova a linha do navigation.replace daqui também
    await register(nome.trim(), email.trim(), pass)
  }

  function goToLogin() {
    setAuthError('')
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.title} accessibilityRole="header">Criar conta</Text>
            <Text style={styles.subtitle}>Preencha os campos abaixo para se cadastrar</Text>

            {/* Erro backend */}
            {!!authError && (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Text style={styles.errorBoxText}>{authError}</Text>
              </View>
            )}

            <Field
              label="Nome completo" icon="user" error={nomeErr}
              placeholder="Seu nome completo"
              value={nome}
              onChangeText={v => { setNome(v); setNomeErr('') }}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <Field
              ref={emailRef} style={styles.fieldGap}
              label="E-mail" icon="mail" error={emailErr}
              placeholder="seu@email.com"
              value={email}
              onChangeText={v => { setEmail(v); setEmailErr('') }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => telRef.current?.focus()}
            />

            <Field
              ref={telRef} style={styles.fieldGap}
              label="Telefone" icon="phone"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChangeText={v => setTelefone(formatarTelefone(v))}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={15}
              returnKeyType="next"
              onSubmitEditing={() => passRef.current?.focus()}
            />

            <Field
              ref={passRef} style={styles.fieldGap}
              label="Senha" icon="lock" error={passErr} secure
              placeholder="Crie uma senha"
              onFocusChange={setPassFocused}
              value={pass}
              onChangeText={v => { setPass(v); setPassErr(''); setAuthError('') }}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="next"
              onSubmitEditing={() => confRef.current?.focus()}
            />

            {/* Requisitos da senha */}
            {showPassRules && (
              <View style={styles.rules} accessibilityLabel="Requisitos da senha">
                {PASS_RULES.map((r, i) => (
                  <View key={r.label} style={styles.ruleRow}>
                    <View style={[styles.ruleDot, passChecks[i] && styles.ruleDotOk]}>
                      {passChecks[i] && <Icon name="check" color={colors.white} size={10} />}
                    </View>
                    <Text style={[styles.ruleText, passChecks[i] && styles.ruleTextOk]}>{r.label}</Text>
                  </View>
                ))}
              </View>
            )}

            <Field
              ref={confRef} style={styles.fieldGap}
              label="Confirmar senha" icon="lock" error={confErr} secure
              placeholder="Digite sua senha novamente"
              value={confirm}
              onChangeText={v => { setConfirm(v); setConfErr('') }}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            {/* Termos */}
            <View style={styles.terms}>
              <TouchableOpacity
                style={[styles.checkbox, aceito && styles.checkboxOn, !!aceitoErr && styles.checkboxErr]}
                onPress={() => { setAceito(a => !a); setAceitoErr('') }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 8 }}
                activeOpacity={0.7}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: aceito }}
                accessibilityLabel="Aceitar os Termos de Uso e a Política de Privacidade"
              >
                {aceito && <Icon name="check" color={colors.white} size={12} />}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                Eu concordo com os{' '}
                <Text style={styles.termsLink} accessibilityRole="link" onPress={() => navigation.navigate('Terms')}>
                  Termos de Uso
                </Text>
                {' '}e a{' '}
                <Text style={styles.termsLink} accessibilityRole="link" onPress={() => navigation.navigate('Privacy')}>
                  Política de Privacidade
                </Text>
                .
              </Text>
            </View>
            {!!aceitoErr && <Text style={styles.errText}>{aceitoErr}</Text>}

            {/* Botão criar conta */}
            <TouchableOpacity
              style={[styles.btnPrimary, authLoading && { backgroundColor: colors.primarySoft }]}
              onPress={handleRegister}
              disabled={authLoading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Criar minha conta"
            >
              {authLoading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.btnPrimaryText}>Criar minha conta</Text>
              }
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Voltar para login */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <TouchableOpacity
                onPress={goToLogin}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                accessibilityRole="link"
              >
                <Text style={styles.loginLink}>Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Copyright />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%', maxWidth: 440,
    backgroundColor: colors.white, borderRadius: 24,
    paddingHorizontal: 22, paddingVertical: 26,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title:    { fontSize: 30, color: colors.ink, fontFamily: fonts.bold, textAlign: 'center' },
  subtitle: {
    fontSize: 14, lineHeight: 19, color: colors.gray, fontFamily: fonts.medium,
    textAlign: 'center', marginTop: 4, marginBottom: 20,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.primarySoft,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
  },
  errorBoxText: { fontSize: 13, color: colors.danger, fontFamily: fonts.semiBold, textAlign: 'center' },
  label:    { fontSize: 14, color: colors.inkSoft, fontFamily: fonts.semiBold, marginBottom: 6 },
  fieldGap: { marginTop: 12 },
  field: {
    height: 50, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: colors.line, borderRadius: radius.input,
    paddingHorizontal: 14, backgroundColor: colors.white,
  },
  fieldFocus: { borderColor: colors.primary },
  fieldErr:   { borderColor: colors.danger },
  input: {
    flex: 1, minWidth: 0, height: '100%', padding: 0,
    fontSize: 15, color: colors.inkSoft, fontFamily: fonts.regular,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  errText: { fontSize: 12, color: colors.danger, fontFamily: fonts.semiBold, marginTop: 5, paddingLeft: 2 },
  rules: {
    marginTop: 6, gap: 8,
    borderWidth: 1, borderColor: colors.line, borderRadius: radius.input,
    paddingHorizontal: 14, paddingVertical: 12, backgroundColor: colors.white,
  },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ruleDot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 1.5, borderColor: colors.grayLight,
    alignItems: 'center', justifyContent: 'center',
  },
  ruleDotOk:  { backgroundColor: colors.success, borderColor: colors.success },
  ruleText:   { flex: 1, fontSize: 13, color: colors.gray, fontFamily: fonts.medium },
  ruleTextOk: { color: colors.inkSoft },
  terms: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 16 },
  checkbox: {
    width: 18, height: 18, borderRadius: 5, marginTop: 1,
    borderWidth: 1.5, borderColor: colors.grayLight, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn:  { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxErr: { borderColor: colors.danger },
  termsText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.gray, fontFamily: fonts.medium },
  termsLink: { color: colors.primary, fontFamily: fonts.semiBold },
  btnPrimary: {
    height: 52, borderRadius: 50, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 20,
  },
  btnPrimaryText: { color: colors.white, fontSize: 17, fontFamily: fonts.bold },
  divider:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18, marginBottom: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { fontSize: 13, color: colors.gray, fontFamily: fonts.medium },
  loginRow:  { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, color: colors.gray, fontFamily: fonts.medium },
  loginLink: { fontSize: 14, color: colors.primary, fontFamily: fonts.bold },
})
