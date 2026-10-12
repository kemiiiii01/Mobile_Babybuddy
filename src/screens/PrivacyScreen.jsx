import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Icon } from '../components/Icon'
import { Copyright } from '../components/Copyright'
import { colors, fonts } from '../theme'

// h = título numerado (negrito) · p = parágrafo · b = item de lista
const CONTENT = [
  ['h', '1. Visão Geral da Política de Privacidade'],
  ['p', 'Esta Política explica como podemos processar as suas informações. Esta Política pode ser alterada ou atualizada de tempos em tempos, portanto verifique regularmente se há atualizações.'],
  ['p', 'Esta Política de Privacidade aplica-se a todas as informações recolhidas sobre você quando você interage com os Serviços, independentemente de como são recolhidas ou armazenadas, e descreve, entre outras coisas, os tipos de informações recolhidas sobre você quando você interage com os Serviços, como as suas informações podem ser usadas e como as suas informações são protegidas.'],
  ['p', 'Que Categorias de Informação Podemos Processar'],
  ['p', 'Podemos processar: os seus dados pessoais; os dados demográficos: os seus detalhes de contato; registos dos seus consentimentos; informações sobre as suas interações com o nosso conteúdo; e quaisquer opiniões que nos fornece.'],
  ['p', '“Informações Pessoais” significa informações que são sobre qualquer indivíduo ou pelas quais qualquer indivíduo é direto ou indiretamente identificável. “Processo”, “Processamento” ou “Processado” significa tudo o que é feito com qualquer Informação Pessoal, seja ou não por meios automatizados, tais como coleta, gravação, organização, estruturação, armazenamento, adaptação ou alteração, recuperação, consulta, uso, disseminação ou disponibilização de qualquer outra forma, alinhamento ou combinação, restrição, eliminação ou destruição.'],
  ['p', 'Podemos Processar as seguintes categorias de informações pessoais sobre si:'],
  ['b', 'Dados pessoais: o seu nome; o nome de utilizador/usuário ou detalhes de início de sessão; a senha; as áreas ou tópicos de interesse; a data prevista para o parto.'],
  ['b', 'Informação demográfica: o gênero; a idade/data de nascimento.'],
  ['b', 'Dados de contato: o número de telefone e/ou celular; o endereço de e-mail.'],
  ['b', 'Registos de consentimento: os registos de quaisquer consentimentos que possa ter dado, juntamente com a data e hora, os meios de consentimento e quaisquer informações.'],
  ['b', 'Pareceres e opiniões: quaisquer pareceres e opiniões que você ou outros usuários decidem nos enviar.'],
  ['p', 'Sob certas circunstâncias e dependendo da lei aplicável, algumas destas Outras Informações podem constituir Informações Pessoais. As Informações Pessoais juntamente com as Outras Informações são doravante referidas como “Informações do usuário”.'],

  ['h', '2. Como Recolhemos ou Criamos Informações'],
  ['p', 'Podemos recolher ou obter Informações do Usuário das seguintes maneiras: diretamente; quando visita nossos Serviços; quando se cadastra para usar qualquer parte dos Serviços; ou quando interage com qualquer conteúdo nos Serviços.'],
  ['b', 'Coleta de Informações do Usuário: Podemos recolher Informações do Usuário sobre si das seguintes fontes:'],
  ['b', 'Dados que fornece: Podemos obter as suas Informações Pessoais quando você as fornecer nos nossos Serviços (por exemplo, quando optar por receber e-mails); entrar em contato por e-mail, telefone ou por qualquer outro meio; etc.).'],
  ['b', 'Dados de relacionamento: Podemos recolher ou obter as suas Informações Pessoais ao longo do nosso relacionamento.'],
  ['b', 'Conteúdo: Se optar por interagir com qualquer conteúdo nos Serviços, poderemos receber Informações do Usuário sobre você.'],
  ['p', 'Criação de Informações do Usuário: Também podemos criar Informações do Usuário, tais como registros das suas interações conosco, para fins administrativos internos e análise. Também podemos usar as Informações do Usuário que nos forneceu dados obtidos para melhorar os nossos registros ou melhorar a nossa capacidade de fornecer conteúdos, tais como acrescentar informações adicionais ao seu perfil.'],

  ['h', '3. Propósitos Para os Quais Podemos Processar as suas Informações'],
  ['p', 'Podemos Processar Informações do Usuário para os seguintes propósitos:'],
  ['b', 'Oferecer e Melhorar os Serviços: ao operar e gerir os Serviços para você; fornecer-lhe conteúdo personalizado; comunicar e interagir com você através dos Serviços; identificar problemas com os Serviços e planejar melhorias ou criar Serviços; e notificá-lo sobre alterações em qualquer um dos nossos Serviços.'],
  ['b', 'Identificação: usar informações de terceiros para verificar informações sobre você.'],
  ['b', 'Pesquisa: análise, avaliação comparativa e realização de pesquisas com base nas Informações do Usuário e as suas interações com os Serviços.'],
  ['b', 'Comunicações: comunicar consigo através de qualquer meio (incluindo via e-mail e telefone) em relação a conteúdos e outras informações nas quais possa estar interessado, sujeito a garantir que tais comunicações lhe são fornecidas em conformidade com a lei aplicável; manter e atualizar as suas informações de contato quando apropriado; e obter o seu consentimento prévio, quando necessário.'],
  ['b', 'Publicidade: fornecer publicidade com base nos seus interesses e interações com os Serviços e Canais, incluindo o uso de Informações do Usuário para veicular anúncios nos Serviços e Canais.'],
  ['b', 'Administração de TI: administração dos sistemas de tecnologia; segurança de rede e de dispositivo; implementar políticas de segurança de dados e sistemas de informação; auditorias de conformidade em relação às políticas internas; identificação e mitigação de atividade fraudulenta; e cumprimento dos requisitos legais.'],
  ['b', 'Segurança: medidas de segurança eletrônica para ajudar a reduzir o risco e fornece a capacidade de identificar e corrigir um incidente de segurança.'],

  ['h', '4. Qual é a Base Legal para Processar Informações Pessoais'],
  ['p', 'Podemos Processar as suas Informações do Usuário pelos seguintes motivos:'],
  ['b', 'Consentimento: podemos Processar as suas Informações do Usuário onde obtivemos seu consentimento prévio e expresso para o Processamento;'],
  ['b', 'Conformidade com a lei aplicável: Podemos Processar as suas Informações do Usuário quando o Processamento for exigido pela lei aplicável;'],
  ['b', 'Interesses vitais: Podemos processar as suas Informações do Usuário onde o Processamento é necessário para proteger os interesses vitais de qualquer indivíduo;'],
  ['b', 'Interesses legítimos: Podemos processar as suas Informações do Usuário quando tivermos interesse legítimo em realizar o Processamento com a finalidade de gerir, operar ou promover os nossos negócios e que o interesse legítimo não seja anulado pelos seus interesses, direitos fundamentais ou liberdades.'],
  ['p', 'Que Informações Divulgamos a Terceiros:'],
  ['p', 'Podemos divulgar as suas Informações do Usuário a: autoridades legais e reguladoras; os nossos consultores externos; partes que Processam Informações do Usuário em nosso nome; qualquer parte que seja necessária em relação a um processo judicial; qualquer parte necessária para investigar, detectar ou prevenir infrações penais e quaisquer terceiros fornecedores de conteúdo usado nos Serviços.'],
  ['p', 'Além disso, podemos divulgar suas Informações do Usuário a:'],
  ['b', 'Podemos contratar prestadores de serviços terceirizados para ajudar na recolha, armazenamento e segmentação de Dados On-line, e os fornecedores devem manter a confidencialidade dessas informações. Esses fornecedores terceirizados podem recolher Informações do Usuário dos nossos Serviços para os seus próprios fins, incluindo, entre outros, a monitorização de fraudes na web.'],
  ['b', 'Se contratarmos um Processador terceirizado para Processar as suas Informações do Usuário, o Processador estará sujeito a obrigações contratuais vinculantes para: somente Processar as Informações do Usuário de acordo com as nossas instruções anteriores por escrito; e (ii) usar medidas para proteger a confidencialidade e segurança das Informações do Usuário; juntamente com quaisquer requisitos adicionais nos termos da lei aplicável.'],

  ['h', '5. Segurança de Dados'],
  ['p', 'Implementámos medidas de segurança técnicas e organizacionais adequadas para proteger as suas Informações do Usuário contra destruição acidental ou ilegal, perda, alteração, divulgação não autorizada, acesso não autorizado e outras formas ilegais ou não autorizadas de Processamento, de acordo com a legislação aplicável. Em certos casos, podemos usar a criptografia e/ou transferir certas Informações do Usuário em um formato legível não-humano para fornecer proteção. No entanto, não podemos garantir que não haverá uma violação e não somos responsáveis por qualquer violação de segurança ou pelas ações de terceiros.'],

  ['h', '6. Exatidão dos Dados'],
  ['p', 'Tomamos todas as medidas razoáveis para garantir que as Informações do Usuário que processamos são exatas e, quando necessário, atualizadas, e que qualquer uma das suas Informações do Usuário que Processamos e sobre as quais nos informes que estão incorretas, elas são apagadas ou corrigidas.'],

  ['h', '7. Seus Direitos em Relação às Suas Informações Pessoais'],
  ['p', 'Muitas regulamentações de privacidade concedem aos consumidores diversos direitos específicos. Se você é residente da União Europeia (nos termos do GDPR), Reino Unido (nos termos do UK GDPR), Brasil (nos termos do LGPD), vários estados dos EUA, incluindo a Califórnia (CCPA), Virgínia (nos termos do VCDPA), Colorado (nos termos do CPA) e Connecticut (nos termos do CTDPA), ou em outra jurisdição com requisitos de privacidade semelhantes, você possui certos direitos, que podem incluir os listados abaixo.'],
  ['p', 'Seus Direitos:'],
  ['b', 'Direito de Retirar o Consentimento: Quando for solicitado que você consinta no processamento de suas informações pessoais, você tem o direito de retirar seu consentimento a qualquer momento.'],
  ['b', 'Direito de Saber: Você tem o direito de saber quais informações pessoais coletamos e processamos. Esta política tem como objetivo fornecer transparência em relação aos seus dados.'],
]

export default function PrivacyScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.grayBg }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Voltar">
          <Icon name="back" color={colors.black} size={26} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Política de Privacidade</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {CONTENT.map(([type, text], i) => {
          if (type === 'h') {
            return <Text key={i} style={[styles.heading, i > 0 && styles.headingGap]} accessibilityRole="header">{text}</Text>
          }
          if (type === 'b') {
            return (
              <View key={i} style={styles.bullet}>
                <Text style={styles.text}>•</Text>
                <Text style={[styles.text, { flex: 1 }]}>{text}</Text>
              </View>
            )
          }
          return <Text key={i} style={styles.text}>{text}</Text>
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
})
