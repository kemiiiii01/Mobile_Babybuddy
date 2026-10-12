import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/Icon'
import { Copyright } from '../components/Copyright'
import { colors, fonts } from '../theme'

// h = título numerado (negrito) · p = parágrafo · b = item de lista
// c = parágrafo de contato (mais afastado) · e = e-mail (negrito, abre o app de e-mail)
const CONTENT = [
  ['p', 'Este Aplicativo é Apenas para Fins Informativos e Não Fornece Aconselhamento Médico.'],
  ['p', 'Ao acessar ou usar os Sites ou Serviços, você concorda com estes Termos de Utilização (TDU). Se não concordar, não utilize os Sites ou Serviços.'],

  ['h', '1. Finalidade Informativa'],
  ['b', 'O Site e Serviços oferecem informações sobre saúde infantil, desenvolvimento e nutrição, mas não substituem aconselhamento médico profissional.'],
  ['b', 'Consulte sempre um pediatra ou profissional de saúde antes de tomar decisões com base no conteúdo do site.'],

  ['h', '2. Obrigações do Utilizador'],
  ['b', 'Você concorda em usar os Sites e Serviços de forma legal e responsável.'],
  ['b', 'Não pode copiar, modificar ou distribuir conteúdo sem autorização.'],

  ['h', '3. Privacidade e Segurança'],
  ['b', 'Nossa Política de Privacidade regula o uso de seus dados.'],
  ['b', 'Você é responsável por manter sua conta e senha seguras.'],

  ['h', '4. Direitos Autorais'],
  ['b', 'Se acredita que seu conteúdo foi usado sem autorização, notifique nossa equipe (contato abaixo).'],

  ['h', '5. Limitação de Responsabilidade'],
  ['b', 'Não garantimos a precisão ou disponibilidade contínua dos Sites/Serviços.'],
  ['b', 'Não nos responsabilizamos por danos decorrentes do uso ou indisponibilidade dos Sites.'],

  ['h', '6. Alterações nos Termos'],
  ['b', 'Podemos atualizar estes termos a qualquer momento. O uso continuado significa aceitação das mudanças.'],
  ['c', 'Contato com a equipe'],
  ['e', 'Babybuddy159@gmail.com'],
  ['p', 'Se tiver dúvidas, entre em contato conosco.'],
]

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.grayBg }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
          <Icon name="back" color={colors.black} size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Termos de Uso</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {CONTENT.map(([type, text], i) => {
          if (type === 'h') {
            return <Text key={i} style={[styles.heading, styles.headingGap]} accessibilityRole="header">{text}</Text>
          }
          if (type === 'e') {
            return (
              <View key={i} style={styles.bullet}>
                <Text style={styles.text}>•</Text>
                <Text
                  style={[styles.text, styles.email]}
                  accessibilityRole="link"
                  onPress={() => Linking.openURL(`mailto:${text}`).catch(() => {})}
                >
                  {text}
                </Text>
              </View>
            )
          }
          if (type === 'b') {
            return (
              <View key={i} style={styles.bullet}>
                <Text style={styles.text}>•</Text>
                <Text style={[styles.text, { flex: 1 }]}>{text}</Text>
              </View>
            )
          }
          return <Text key={i} style={[styles.text, type === 'c' && styles.contactGap]}>{text}</Text>
        })}
        <Copyright />
      </ScrollView>
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
  body: { flexGrow: 1, padding: 20, paddingBottom: 20, gap: 6 },
  heading:    { fontSize: 16, lineHeight: 22, fontFamily: fonts.bold, color: colors.black, textAlign: 'left' },
  headingGap: { marginTop: 12 },
  text:   { fontSize: 14, lineHeight: 21, fontFamily: fonts.regular, color: colors.black, textAlign: 'left' },
  bullet: { flexDirection: 'row', gap: 8, paddingLeft: 6 },
  contactGap: { marginTop: 22 },
  email: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
})
