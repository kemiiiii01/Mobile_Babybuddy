import { Text, StyleSheet } from 'react-native'
import { colors, fonts } from '../theme'

// Fica no pé da tela: o contêiner pai precisa ocupar a altura toda (flexGrow: 1).
export function Copyright({ style }) {
  return <Text style={[styles.text, style]}>© 2026 BabyBuddy</Text>
}

const styles = StyleSheet.create({
  text: { fontSize: 12, color: colors.grayLight, fontFamily: fonts.medium, textAlign: 'center', marginTop: 'auto', paddingTop: 20 },
})
