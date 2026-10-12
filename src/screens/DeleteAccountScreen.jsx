import { useEffect, useRef, useState } from 'react'
import {
  View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator,
  Animated, Easing, useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { colors, fonts, layout } from '../theme'

export default function DeleteAccountScreen({ navigation }) {
  const { deleteCurrentAccount } = useApp()
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // A tela sobe de baixo ao abrir e desce ao fechar. A animação é feita aqui (e não
  // pelo navegador de telas) para ter o mesmo ritmo no Android, no iOS e na web.
  const { height } = useWindowDimensions()
  const translateY = useRef(new Animated.Value(height)).current
  const closing = useRef(false)

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start()
  }, [translateY])

  // Cobre X, Cancelar e o botão/gesto de voltar do aparelho.
  useEffect(() => navigation.addListener('beforeRemove', e => {
    if (closing.current) return
    e.preventDefault()
    closing.current = true
    Animated.timing(translateY, {
      toValue: height, duration: 480, easing: Easing.in(Easing.cubic), useNativeDriver: true,
    }).start(() => navigation.dispatch(e.data.action))
  }), [navigation, translateY, height])

  async function handleDelete() {
    if (!confirmed) { setConfirmed(true); return }
    setLoading(true)
    try {
      await deleteCurrentAccount()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Animated.View style={{ flex: 1, transform: [{ translateY }] }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Fechar">
          <Icon name="x" color={colors.black} size={26} />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* O PNG tem fundo quase branco em volta do círculo; o recorte redondo esconde essa borda. */}
        <View style={styles.illustration}>
          <Image
            source={require('../../assets/icon-excluir-conta.png')}
            style={styles.illustrationImg}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Excluir conta?</Text>
        <Text style={styles.desc}>
          Esta ação é irreversível. Todos os seus dados, lembretes e eventos serão
          excluídos.
        </Text>

        {confirmed && (
          <View style={styles.confirmBox}>
            <Icon name="warn" color={colors.danger} size={16} />
            <Text style={styles.confirmText}>
              Confirme novamente para excluir definitivamente.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.deleteBtn, loading && { opacity: 0.6 }]}
          onPress={handleDelete}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color={colors.black} />
            : <>
                <Icon name="trash" color={colors.black} size={18} />
                <Text style={styles.deleteBtnText}>
                  {confirmed ? 'Confirmar exclusão' : 'Excluir conta'}
                </Text>
              </>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: 24, alignItems: 'center', justifyContent: 'center', gap: 16 },
  illustration: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden' },
  illustrationImg: { width: 148, height: 148, marginLeft: -14, marginTop: -15 },
  title: { fontSize: 22, fontFamily: fonts.extraBold, color: colors.black },
  desc: { fontSize: 13, color: colors.blackSoft, fontFamily: fonts.medium, textAlign: 'center', lineHeight: 20, marginTop: -8, paddingHorizontal: 36 },
  confirmBox: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: colors.dangerSoft, borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: colors.primarySoft, alignSelf: 'stretch',
  },
  confirmText: { flex: 1, fontSize: 12, color: colors.danger, fontFamily: fonts.bold },
  deleteBtn: {
    backgroundColor: colors.line, borderRadius: 50,
    paddingVertical: 8, minHeight: 38, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, alignSelf: 'stretch',
  },
  deleteBtnText: { color: colors.black, fontFamily: fonts.extraBold, fontSize: 15 },
  cancelBtn: {
    borderRadius: 50, borderWidth: 1.5, borderColor: colors.border,
    paddingVertical: 10, alignItems: 'center', alignSelf: 'stretch', marginTop: -6,
  },
  cancelBtnText: { color: colors.primary, fontSize: 13, fontFamily: fonts.extraBold },
})
