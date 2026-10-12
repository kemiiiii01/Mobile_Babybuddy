import { StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, fonts } from '../theme'
import { gestationMonth } from '../constants/stories'

const BASE_SIZE = 220 // tamanho para o qual as medidas abaixo foram desenhadas

// Círculo rosa com as semanas em destaque e o mês de gestação. Sem `weeks`,
// mostra o conteúdo passado em children (por exemplo, o convite para configurar).
export function WeeksCircle({ weeks, size, children }) {
  // em círculos menores, o texto encolhe na mesma proporção para não encostar na borda
  const k = Math.min(1, size / BASE_SIZE)
  return (
    <View style={[styles.halo, { borderRadius: size / 2 + 10 }]}>
      <LinearGradient
        colors={['#F8CFDB', '#EE9DB6']}
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      >
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
    </View>
  )
}

const styles = StyleSheet.create({
  // anel suave em volta do círculo
  halo:   { padding: 10, borderWidth: 1, borderColor: 'rgba(238,157,182,0.5)' },
  circle: { alignItems: 'center', justifyContent: 'center' },
  number: { fontFamily: fonts.bold, color: colors.white },
  weeks:  { fontFamily: fonts.bold, color: colors.white },
  rule:   { width: 28, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.7)' },
  month:  { fontFamily: fonts.medium, color: colors.white },
})
