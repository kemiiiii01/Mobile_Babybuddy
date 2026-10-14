import { StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Circle } from 'react-native-svg'
import { colors, fonts } from '../theme'
import { gestationMonth } from '../constants/stories'

const BASE_SIZE = 220 // tamanho para o qual as medidas abaixo foram desenhadas
const RING = 6        // espessura da barra de progresso
const TRACK = 'rgba(218,29,107,0.14)'
// Vidro rosado: claro no alto, ganhando um pouco de cor para baixo.
const GLASS = ['rgba(255,255,255,0.92)', 'rgba(251,214,229,0.85)', 'rgba(243,180,208,0.75)']

// Círculo de vidro rosado com as semanas em destaque e o mês de gestação, cercado por
// uma barra que avança conforme a gestação (progress de 0 a 1). Sem `weeks`, mostra o
// conteúdo passado em children (por exemplo, o convite para configurar).
export function WeeksCircle({ weeks, progress = 0, size, children }) {
  // em círculos menores, o texto encolhe na mesma proporção para não encostar na borda
  const k = Math.min(1, size / BASE_SIZE)
  const outer = size + 2 * RING
  const r = (outer - RING) / 2
  const length = 2 * Math.PI * r
  const done = Math.min(1, Math.max(0, progress))
  // o vidro vai até o meio da barra, para não sobrar nenhuma faixa entre os dois
  const glass = outer - RING

  return (
    <View style={[styles.wrap, { width: outer, height: outer, borderRadius: outer / 2 }]}>
      <LinearGradient
        colors={GLASS}
        locations={[0, 0.55, 1]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.circle, { width: glass, height: glass, borderRadius: glass / 2 }]}
      >
        {/* reflexo no alto do vidro */}
        <View
          pointerEvents="none"
          style={[styles.shine, { width: glass * 0.62, height: glass * 0.3, borderRadius: glass, top: glass * 0.07 }]}
        />
        {weeks ? (
          <>
            {/* A League Spartan desenha os números acima do meio da linha: o paddingTop
                compensa isso para o bloco ficar no centro óptico do círculo. */}
            <Text style={[styles.number, { fontSize: 84 * k, lineHeight: 84 * k, paddingTop: 12 * k }]}>{weeks}</Text>
            <Text style={[styles.weeks, { fontSize: 15 * k, lineHeight: 18 * k, letterSpacing: 3 * k, marginTop: -4 * k }]}>
              {weeks === 1 ? 'SEMANA' : 'SEMANAS'}
            </Text>
            <View style={[styles.rule, { marginVertical: 10 * k }]} />
            <Text style={[styles.month, { fontSize: 14 * k, lineHeight: 18 * k }]}>{gestationMonth(weeks)}º mês de gestação</Text>
          </>
        ) : children}
      </LinearGradient>

      {/* a barra fica por cima da borda do vidro; começa no topo e corre no sentido horário */}
      <Svg
        width={outer} height={outer} pointerEvents="none"
        style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}
      >
        <Circle cx={outer / 2} cy={outer / 2} r={r} stroke={TRACK} strokeWidth={RING} fill="none" />
        {weeks && done > 0 ? (
          <Circle
            cx={outer / 2} cy={outer / 2} r={r}
            stroke={colors.primary} strokeWidth={RING} fill="none" strokeLinecap="round"
            strokeDasharray={`${length} ${length}`}
            strokeDashoffset={length * (1 - done)}
          />
        ) : null}
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary, shadowOpacity: 0.16, shadowRadius: 22, shadowOffset: { width: 0, height: 10 },
    elevation: 6, backgroundColor: colors.white,
  },
  circle: {
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  shine:  { position: 'absolute', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.22)' },
  number: { fontFamily: fonts.bold, color: colors.primary },
  weeks:  { fontFamily: fonts.bold, color: colors.primary },
  rule:   { width: 28, height: 2, borderRadius: 1, backgroundColor: 'rgba(218,29,107,0.35)' },
  month:  { fontFamily: fonts.medium, color: colors.blackSoft },
})
