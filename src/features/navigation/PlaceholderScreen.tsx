import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { ArrowLeft } from 'lucide-react-native'

import { colors } from '@/theme/colors'

interface PlaceholderScreenProps {
  title: string
}

export function PlaceholderScreen({ title }: PlaceholderScreenProps) {
  const navigation = useNavigation()

  return (
    <SafeAreaView style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color={colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Em breve.</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAlt,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 22,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    color: colors.textSecondary,
    fontSize: 15,
  },
})
