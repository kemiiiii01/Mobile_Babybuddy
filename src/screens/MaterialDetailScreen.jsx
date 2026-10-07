import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Icon } from '../components/Icon'
import { Copyright } from '../components/Copyright'
import { colors, fonts } from '../theme'
import { obterMaterial } from '../application/material'

export default function MaterialDetailScreen({ route, navigation }) {
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    obterMaterial(route.params.materialId).then(setMaterial).catch(() => setError('Este artigo não está disponível.')).finally(() => setLoading(false))
  }, [route.params.materialId])

  async function openPdf() {
    if (!material?.pdfUrl) return
    try { await Linking.openURL(material.pdfUrl) }
    catch (_) {
      const message = 'Não foi possível abrir o PDF neste dispositivo.'
      if (Platform.OS === 'web') globalThis.alert(message)
      else Alert.alert('PDF indisponível', message)
    }
  }

  if (loading) return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></SafeAreaView>

  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}>
    <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()} accessibilityLabel="Voltar aos artigos"><Icon name="back" color={colors.primaryDark} size={20} /><Text style={styles.backText}>Artigos</Text></TouchableOpacity>
    {error || !material ? <View style={styles.state}><Icon name="warn" color={colors.primary} size={34} /><Text style={styles.title}>Artigo indisponível</Text><Text style={styles.description}>{error}</Text></View>
      : <>{material.coverUrl ? <Image source={{ uri: material.coverUrl }} style={styles.cover} resizeMode="cover" accessibilityLabel={`Capa de ${material.title}`} />
        : <LinearGradient colors={[colors.surface, colors.border]} style={[styles.cover, styles.placeholder]}><Icon name="file" color={colors.primary} size={46} /></LinearGradient>}
        <Text style={styles.category}>{material.category.toUpperCase()}</Text><Text style={styles.title}>{material.title}</Text>
        <View style={styles.meta}><Text style={styles.author}>Por {material.author}</Text>{material.publishedAt && <Text style={styles.date}>{formatDate(material.publishedAt)}</Text>}</View>
        <Text style={styles.description}>{material.description}</Text>
        {material.pdfUrl ? <TouchableOpacity style={styles.button} onPress={openPdf} accessibilityRole="link"><Icon name="file" color={colors.white} size={19} /><Text style={styles.buttonText}>Abrir PDF</Text><Icon name="fwd" color={colors.white} size={17} /></TouchableOpacity>
          : <View style={styles.notice}><Text style={styles.noticeTitle}>PDF ainda não publicado</Text><Text style={styles.stateText}>Este conteúdo continua disponível apenas na versão web anterior.</Text></View>}</>}
    <Copyright />
  </ScrollView></SafeAreaView>
}

function formatDate(value) { return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(value)) }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }, content: { padding: 18, paddingBottom: 40 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 12 }, backText: { color: colors.primaryDark, fontSize: 13, fontFamily: fonts.extraBold },
  cover: { width: '100%', height: 360, borderRadius: 26, backgroundColor: colors.surface }, placeholder: { alignItems: 'center', justifyContent: 'center' },
  category: { color: colors.primary, fontSize: 11, fontFamily: fonts.extraBold, letterSpacing: 1, marginTop: 22 }, title: { color: colors.text, fontSize: 29, lineHeight: 34, fontFamily: fonts.extraBold, marginTop: 8 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 }, author: { color: colors.textMuted, fontSize: 12, fontFamily: fonts.extraBold }, date: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 12 },
  description: { color: colors.textSecondary, fontFamily: fonts.medium, fontSize: 15, lineHeight: 23, marginTop: 18 }, button: { backgroundColor: colors.primary, borderRadius: 17, paddingHorizontal: 18, paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9, marginTop: 26 },
  buttonText: { flex: 1, color: colors.white, fontSize: 14, fontFamily: fonts.extraBold, textAlign: 'center' }, notice: { padding: 18, borderRadius: 17, backgroundColor: colors.surface, marginTop: 24 },
  noticeTitle: { color: colors.primaryDark, fontSize: 14, fontFamily: fonts.extraBold, marginBottom: 5 }, stateText: { color: colors.textMuted, fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 }, state: { alignItems: 'center', paddingVertical: 48 },
})
