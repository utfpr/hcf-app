import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { RootStackParamList } from '@/navigation/types'

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Formulario', { latitude: -25.4284, longitude: -49.2733 })}
      >
        <Text style={styles.buttonText}>Registrar coleta</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#082113',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#00B14F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
})