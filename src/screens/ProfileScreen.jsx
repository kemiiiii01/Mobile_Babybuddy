import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApp } from '../context/AppContext'
import { Icon } from '../components/Icon'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { colors, fonts } from '../theme'

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.menuIcon}>
        <Icon name={icon} color={colors.black} size={18} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {!!onPress && <Icon name="fwd" color={colors.grayLight} size={16} />}
    </TouchableOpacity>
  )
}

export default function ProfileScreen({ navigation }) {
  const { currentUser, logout } = useApp()

  const [confirmingLogout, setConfirmingLogout] = useState(false)

  function confirmLogout() {
    setConfirmingLogout(false)
    logout()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <Icon name="user" color={colors.primary} size={32} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={2}>{currentUser?.nome || 'Usuária'}</Text>
          {!!currentUser?.email && <Text style={styles.userEmail} numberOfLines={1}>{currentUser.email}</Text>}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.section}>MINHA CONTA</Text>
        <MenuItem icon="edit"   label="Dados Pessoais"     onPress={() => navigation.navigate('PersonalData')} />
        <MenuItem icon="shield" label="Alterar Senha"      onPress={() => navigation.navigate('ChangePassword')} />

        <Text style={styles.section}>INFORMAÇÕES</Text>
        <MenuItem icon="file"   label="Política de Privacidade" onPress={() => navigation.navigate('Privacy')} />
        <MenuItem icon="check"  label="Termos de Uso"           onPress={() => navigation.navigate('Terms')} />
        <MenuItem icon="globe"  label="Português - Brasil" />

        <Text style={styles.section}>SESSÃO</Text>
        <MenuItem icon="logout" label="Sair"               onPress={() => setConfirmingLogout(true)} />
        <MenuItem icon="trash"  label="Excluir Conta"      onPress={() => navigation.navigate('DeleteAccount')} />
      </ScrollView>

      <ConfirmDialog
        visible={confirmingLogout}
        icon="logout"
        title="Deseja sair?"
        message={'Você precisará entrar novamente\npara acessar sua conta.'}
        confirmLabel="Sair da conta"
        onConfirm={confirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 24, marginHorizontal: 16, marginTop: 16, borderRadius: 18,
    // fundo transparente: só a borda fina no rosa do projeto delimita o card
    backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(218,29,107,0.18)',
  },
  avatarWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(218,29,107,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  userInfo:  { flexShrink: 1, gap: 2 },
  userName:  { fontSize: 18, fontFamily: fonts.extraBold, color: colors.black },
  userEmail: { fontSize: 11, fontFamily: fonts.medium, color: colors.blackSoft, textDecorationLine: 'underline' },
  body: { padding: 16, paddingTop: 20, paddingBottom: 30 },
  section: { fontSize: 10, fontFamily: fonts.extraBold, color: colors.gray, letterSpacing: 1, marginTop: 24, marginBottom: 8, paddingLeft: 4 },
  menuItem: {
    backgroundColor: colors.white, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 9,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  menuIcon: {
    width: 34, height: 34, borderRadius: 12,
    backgroundColor: colors.line, alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 13, fontFamily: fonts.bold, color: colors.black },
})
