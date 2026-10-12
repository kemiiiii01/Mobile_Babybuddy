import { useEffect, useRef } from 'react'
import { Animated, Easing, StyleSheet } from 'react-native'
import { colors } from '../theme'

// Abertura do aplicativo: o logo aparece, fica um instante e some. 7 segundos no total.
const FADE_IN_MS = 1500
const HOLD_MS = 3700
const FADE_OUT_MS = 1500
const REVEAL_MS = 300

export function SplashLogo({ onDone }) {
  const logo = useRef(new Animated.Value(0)).current
  const screen = useRef(new Animated.Value(1)).current

  useEffect(() => {
    // O logo aparece e some sempre sobre o fundo branco. Só depois de ele sumir por
    // completo o fundo abre, para o logo nunca se misturar com a tela que vem em seguida.
    const animation = Animated.sequence([
      Animated.timing(logo, { toValue: 1, duration: FADE_IN_MS, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.delay(HOLD_MS),
      Animated.timing(logo, { toValue: 0, duration: FADE_OUT_MS, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      Animated.timing(screen, { toValue: 0, duration: REVEAL_MS, easing: Easing.linear, useNativeDriver: true }),
    ])
    animation.start(({ finished }) => { if (finished) onDone?.() })
    return () => animation.stop()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.screen, { opacity: screen }]}>
      <Animated.Image
        source={require('../../assets/logo.png')}
        style={[styles.logo, { opacity: logo }]}
        resizeMode="contain"
        accessibilityLabel="BabyBuddy"
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  // zIndex e elevation garantem que o fundo cubra as telas nativas que carregam por baixo
  screen: {
    backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
    zIndex: 100, elevation: 100,
  },
  logo:   { width: 280, height: 266 },
})
