import { useEffect, useRef } from 'react'
import { Animated, Easing } from 'react-native'
import Svg, { Polyline } from 'react-native-svg'
import { colors } from '../theme'

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline)

const POINTS = '0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24'
const LINE = { fill: 'none', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }

// Traço de batimento percorrendo a linha, em loop de 1,4s.
export function Loader({ size = 64 }) {
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: false })
    )
    loop.start()
    return () => loop.stop()
  }, [progress])

  const strokeDashoffset = progress.interpolate({ inputRange: [0, 1], outputRange: [192, 0] })
  const opacity = progress.interpolate({ inputRange: [0, 0.725, 1], outputRange: [1, 0, 1] })

  return (
    <Svg width={size} height={size * 0.75} viewBox="-2 -2 68 52" accessibilityLabel="Carregando">
      <Polyline points={POINTS} stroke="#ff4d5033" {...LINE} />
      <AnimatedPolyline
        points={POINTS}
        stroke={colors.primary}
        strokeDasharray="48, 144"
        strokeDashoffset={strokeDashoffset}
        opacity={opacity}
        {...LINE}
      />
    </Svg>
  )
}
