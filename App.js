import { useState } from 'react'
import { View } from 'react-native'
import { useFonts } from 'expo-font'
import {
  LeagueSpartan_400Regular,
  LeagueSpartan_500Medium,
  LeagueSpartan_600SemiBold,
  LeagueSpartan_700Bold,
  LeagueSpartan_800ExtraBold,
} from '@expo-google-fonts/league-spartan'
import { AppProvider } from './src/context/AppContext'
import AppNavigator from './src/navigation/index'
import { Loader } from './src/components/Loader'
import { SplashLogo } from './src/components/SplashLogo'
import { colors } from './src/theme'

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [fontsLoaded, fontError] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_500Medium,
    LeagueSpartan_600SemiBold,
    LeagueSpartan_700Bold,
    LeagueSpartan_800ExtraBold,
  })

  const ready = fontsLoaded || fontError

  // O logo de abertura fica por cima enquanto as fontes e a sessão carregam por baixo.
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {ready ? (
        <AppProvider>
          <AppNavigator />
        </AppProvider>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Loader />
        </View>
      )}
      {!splashDone && <SplashLogo onDone={() => setSplashDone(true)} />}
    </View>
  )
}
