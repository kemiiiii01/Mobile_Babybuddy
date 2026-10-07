import { Text, StyleSheet } from 'react-native'
import { colors, fonts } from '../theme'

export function Copyright({ style }) {
  return <Text style={[styles.text, style]}>© 2026 BabyBuddy</Text>
}

const styles = StyleSheet.create({
  text: { fontSize: 12, color: colors.grayLight, fontFamily: fonts.medium, textAlign: 'center', marginTop: 20 },
})
