import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from './Icon'
import { colors, fonts } from '../theme'

// Caixa de confirmação centralizada, no visual do app (substitui o alerta do sistema).
export function ConfirmDialog({ visible, icon, title, message, confirmLabel, cancelLabel = 'Cancelar', onConfirm, onCancel }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Fechar" />
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.title}>{title}</Text>
          {!!message && <Text style={styles.message}>{message}</Text>}

          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm} activeOpacity={0.85} accessibilityRole="button">
            {!!icon && <Icon name={icon} color={colors.black} size={16} />}
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.7} accessibilityRole="button">
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  card: {
    width: '100%', maxWidth: 248, backgroundColor: colors.white, borderRadius: 18,
    paddingHorizontal: 16, paddingTop: 18, paddingBottom: 9, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 12,
  },
  title:   { fontSize: 16, fontFamily: fonts.bold, color: colors.black, textAlign: 'center' },
  message: {
    fontSize: 12, lineHeight: 16, fontFamily: fonts.regular, color: colors.blackSoft,
    textAlign: 'center', marginTop: 4,
  },
  confirmBtn: {
    alignSelf: 'stretch', height: 34, borderRadius: 17, backgroundColor: colors.line,
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12,
  },
  confirmText: { fontSize: 13, fontFamily: fonts.bold, color: colors.black },
  cancelBtn:   { alignSelf: 'stretch', height: 34, alignItems: 'center', justifyContent: 'center', marginTop: 0 },
  cancelText:  { fontSize: 13, fontFamily: fonts.semiBold, color: colors.black },
})
