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
import { colors } from './src/theme'

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    LeagueSpartan_400Regular,
    LeagueSpartan_500Medium,
    LeagueSpartan_600SemiBold,
    LeagueSpartan_700Bold,
    LeagueSpartan_800ExtraBold,
  })

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Loader />
      </View>
    )
  }

  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  )
}
