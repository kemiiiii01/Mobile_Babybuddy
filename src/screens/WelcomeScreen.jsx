import { useEffect, useRef, useState } from 'react'
import { Animated, View, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Copyright } from '../components/Copyright'
import { Loader } from '../components/Loader'
import { colors, fonts } from '../theme'

// text: null = loader
const STEPS = [
  { text: null,        duration: 5000 },
  { text: 'Olá',       duration: 3000 },
  { text: 'Bem-Vinda', duration: 4000 },
]
const FADE_MS = 300

export default function WelcomeScreen({ navigation }) {
  const [step, setStep] = useState(0)
  const opacity = useRef(new Animated.Value(0)).current
  const { text, duration } = STEPS[step]

  // Mostra cada etapa pelo seu tempo e, depois da última, segue para a Home.
  useEffect(() => {
    const last = step === STEPS.length - 1
    const fades = text !== null
    if (fades) Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver: true }).start()

    const timer = setTimeout(() => {
      if (last) { navigation.replace('Main'); return }
      if (!fades) { setStep(step + 1); return }
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true })
        .start(() => setStep(step + 1))
    }, last || !fades ? duration : duration - FADE_MS)

    return () => clearTimeout(timer)
  }, [step, text, duration, navigation, opacity])

  // Mesmo enquadramento do loader do AppNavigator, para não haver salto entre os dois.
  if (text === null) {
    return (
      <View style={styles.loading}>
        <Loader />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Animated.Text style={[styles.title, { opacity }]} accessibilityRole="header">
          {text}
        </Animated.Text>
      </View>
      <Copyright style={styles.copyright} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  loading:   { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  safe:      { flex: 1, backgroundColor: colors.background },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title:     { fontSize: 40, fontFamily: fonts.bold, color: colors.primary, textAlign: 'center' },
  copyright: { marginTop: 0, marginBottom: 16 },
})
