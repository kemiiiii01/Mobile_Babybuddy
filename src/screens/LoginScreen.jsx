import { useRef, useState } from 'react'
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

export default function LoginScreen({ navigation }) {
  const { login, authLoading, authError, setAuthError } = useApp()

  const [email, setEmail]       = useState('')
  const [pass, setPass]         = useState('')
  const [showPass, setShowPass] = useState(false)
  const [emailErr, setEmailErr] = useState('')
  const [passErr, setPassErr]   = useState('')
  const [focused, setFocused]   = useState(null)
  const passRef = useRef(null)

  function validateEmail(v) {
    if (!v.trim()) return 'Digite seu e-mail.'
    if (!EMAIL_RE.test(v.trim())) return 'Digite um e-mail válido.'
    return ''
  }

  async function handleLogin() {
    const eErr = validateEmail(email)
    const pErr = pass ? '' : 'Digite sua senha.'
    setEmailErr(eErr)
    setPassErr(pErr)
    if (eErr || pErr) return

    setAuthError('')

    // Apenas espere a função terminar. Se der 'ok', o contexto muda o estado
    // e o AppNavigator te joga para a tela correta automaticamente!
    await login(email, pass)
  }

  function goToRegister() {
    setAuthError('')
    navigation.navigate('Register')
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
            <Text style={styles.title} accessibilityRole="header">Login</Text>
            <Text style={styles.subtitle}>Digite seus dados para acessar sua conta</Text>

            {/* Erro do backend */}
            {!!authError && (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Text style={styles.errorBoxText}>{authError}</Text>
              </View>
            )}

            {/* E-mail */}
            <Text style={styles.label}>E-mail</Text>
            <View style={[styles.field, focused === 'email' && styles.fieldFocus, !!emailErr && styles.fieldErr]}>
              <Icon name="mail" color={focused === 'email' ? colors.primary : colors.gray} size={18} />
              <TextInput
                style={styles.input}
                placeholder="E-mail"
                placeholderTextColor={colors.grayLight}
                value={email}
                onChangeText={v => { setEmail(v); setEmailErr('') }}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="username"
                returnKeyType="next"
                onSubmitEditing={() => passRef.current?.focus()}
                accessibilityLabel="E-mail"
              />
            </View>
            {!!emailErr && <Text style={styles.errText}>{emailErr}</Text>}

            {/* Senha */}
            <Text style={[styles.label, styles.labelGap]}>Senha</Text>
            <View style={[styles.field, focused === 'pass' && styles.fieldFocus, !!passErr && styles.fieldErr]}>
              <Icon name="lock" color={focused === 'pass' ? colors.primary : colors.gray} size={18} />
              <TextInput
                ref={passRef}
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor={colors.grayLight}
                value={pass}
                onChangeText={v => { setPass(v); setPassErr(''); setAuthError('') }}
                onFocus={() => setFocused('pass')}
                onBlur={() => setFocused(null)}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                accessibilityLabel="Senha"
              />
              <TouchableOpacity
                onPress={() => setShowPass(s => !s)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel={showPass ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Icon name={showPass ? 'eyeOff' : 'eye'} color={colors.gray} size={19} />
              </TouchableOpacity>
            </View>
            {!!passErr && <Text style={styles.errText}>{passErr}</Text>}

            {/* Botão login */}
            <TouchableOpacity
              style={[styles.btnPrimary, authLoading && { backgroundColor: colors.primarySoft }]}
              onPress={handleLogin}
              disabled={authLoading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Login"
            >
              {authLoading
                ? <ActivityIndicator color={colors.white} />
                : <Text style={styles.btnPrimaryText}>Login</Text>
              }
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Link para cadastro */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Ainda não tem uma conta? </Text>
              <TouchableOpacity
                onPress={goToRegister}
                hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
                accessibilityRole="link"
              >
                <Text style={styles.registerLink}>Cadastre-se</Text>
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
    paddingHorizontal: 22, paddingVertical: 28,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title:    { fontSize: 34, color: colors.ink, fontFamily: fonts.bold, textAlign: 'center' },
  subtitle: {
    fontSize: 14, lineHeight: 19, color: colors.gray, fontFamily: fonts.medium,
    textAlign: 'center', marginTop: 4, marginBottom: 22,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft, borderWidth: 1, borderColor: colors.primarySoft,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16,
  },
  errorBoxText: { fontSize: 13, color: colors.danger, fontFamily: fonts.semiBold, textAlign: 'center' },
  label:    { fontSize: 14, color: colors.inkSoft, fontFamily: fonts.semiBold, marginBottom: 6 },
  labelGap: { marginTop: 14 },
  field: {
    height: 52, flexDirection: 'row', alignItems: 'center', gap: 10,
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
  btnPrimary: {
    height: 52, borderRadius: 50, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 22,
  },
  btnPrimaryText: { color: colors.white, fontSize: 17, fontFamily: fonts.bold },
  divider:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.line },
  dividerText: { fontSize: 13, color: colors.gray, fontFamily: fonts.medium },
  registerRow:  { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 14, color: colors.gray, fontFamily: fonts.medium },
  registerLink: { fontSize: 14, color: colors.primary, fontFamily: fonts.bold },
})
