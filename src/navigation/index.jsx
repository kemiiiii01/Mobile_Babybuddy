import { useRef } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useApp } from '../context/AppContext'
import { View } from 'react-native'
import { Icon } from '../components/Icon'
import { Loader } from '../components/Loader'
import { colors, fonts, layout } from '../theme'

import LoginScreen from '../screens/LoginScreen'
import RegisterScreen from '../screens/RegisterScreen'
import WelcomeScreen from '../screens/WelcomeScreen'
import HomeScreen from '../screens/HomeScreen'
import CalendarScreen from '../screens/CalendarScreen'
import RemindersScreen from '../screens/RemindersScreen'
import AddReminderScreen from '../screens/AddReminderScreen'
import ProfileScreen from '../screens/ProfileScreen'
import PersonalDataScreen from '../screens/PersonalDataScreen'
import ChangePasswordScreen from '../screens/ChangePasswordScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import DeleteAccountScreen from '../screens/DeleteAccountScreen'
import PrivacyScreen from '../screens/PrivacyScreen'
import TermsScreen from '../screens/TermsScreen'
import StoryScreen from '../screens/StoryScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.placeholder,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 6,
          paddingTop: 6,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 10, fontFamily: fonts.bold },
        // em telas largas o padrão seria o texto ao lado do ícone
        tabBarLabelPosition: 'below-icon',
        tabBarIcon: ({ color, size }) => {
          const iconMap = { Home: 'home', Calendario: 'cal', Lembretes: 'bell', Perfil: 'user' }
          return <Icon name={iconMap[route.name]} color={color} size={size - 2} strokeWidth={1.6} />
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Início' }} />
      <Tab.Screen name="Calendario" component={CalendarScreen} options={{ tabBarLabel: 'Calendário' }} />
      <Tab.Screen name="Lembretes" component={RemindersScreen} options={{ tabBarLabel: 'Lembretes' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  )
}

// Telas de fundo cinza, e as que abrem por cima ocupando a tela toda (elas mesmas
// limitam a largura do seu conteúdo).
const GRAY_SCREENS = ['PersonalData', 'ChangePassword', 'Notifications', 'Privacy', 'Terms']
const FULL_BLEED_SCREENS = ['Story', 'DeleteAccount']

// Em telas largas, cada tela vira uma coluna central; o fundo continua até as bordas.
function screenLayout({ children, route }) {
  if (FULL_BLEED_SCREENS.includes(route.name)) return children
  const backgroundColor = GRAY_SCREENS.includes(route.name) ? colors.grayBg : colors.background
  return (
    <View style={{ flex: 1, alignItems: 'center', backgroundColor }}>
      <View style={{ flex: 1, width: '100%', maxWidth: layout.maxWidth }}>{children}</View>
    </View>
  )
}

function AppNavigator() {
  const { currentUser, authLoading } = useApp()

  // A sequência de boas-vindas só aparece depois de um login ou cadastro feito agora.
  // Quem abre o app já logada vai direto para a Home (só com o logo de abertura).
  const sessionRestored = useRef(null)
  if (!authLoading && sessionRestored.current === null) sessionRestored.current = !!currentUser
  if (!authLoading && !currentUser) sessionRestored.current = false

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Loader />
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenLayout={screenLayout} screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!currentUser ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ animation: 'slide_from_right' }} />
          </>
        ) : (
          <>
            {!sessionRestored.current && <Stack.Screen name="Welcome" component={WelcomeScreen} />}
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="AddReminder" component={AddReminderScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="PersonalData" component={PersonalDataScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} options={{ presentation: 'transparentModal', animation: 'none' }} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="Story" component={StoryScreen} options={{ presentation: 'transparentModal', animation: 'none' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
