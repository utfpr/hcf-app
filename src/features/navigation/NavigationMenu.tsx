import { type ReactNode } from 'react'
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { Bell, Compass, House, RefreshCw, UserRound } from 'lucide-react-native'

import { RootNavigationProp, RootStackParamList } from '@/navigation/types'
import { colors } from '@/theme/colors'

type MenuRoute = Extract<
  keyof RootStackParamList,
  'Home' | 'ExpeditionList' | 'Synchronization' | 'LembreteList' | 'UserProfile'
>

interface MenuItem {
  route: MenuRoute
  label: string
  icon: ReactNode
}

const ITEMS: MenuItem[] = [
  { route: 'Home', label: 'Início', icon: <House size={19} color={colors.accent} /> },
  { route: 'ExpeditionList', label: 'Expedições', icon: <Compass size={19} color={colors.accent} /> },
  { route: 'Synchronization', label: 'Sincronização', icon: <RefreshCw size={19} color={colors.accent} /> },
  { route: 'LembreteList', label: 'Lembretes', icon: <Bell size={19} color={colors.accent} /> },
  { route: 'UserProfile', label: 'Perfil do Usuário', icon: <UserRound size={19} color={colors.accent} /> },
]

interface NavigationMenuProps {
  visible: boolean
  onClose: () => void
  // Rota da tela que abriu o menu, destacada na lista
  current: MenuRoute
  // Altura do cabeçalho da tela, para o menu abrir logo abaixo dele
  headerHeight: number
}

export function NavigationMenu({ visible, onClose, current, headerHeight }: NavigationMenuProps) {
  const navigation = useNavigation<RootNavigationProp>()
  const insets = useSafeAreaInsets()

  function handlePress(route: MenuRoute) {
    onClose()
    if (route !== current) {
      navigation.navigate(route)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.menu, { top: insets.top + headerHeight + 6 }]}>
        <View style={styles.menuHeader}>
          <Text style={styles.menuTitle}>Navegação</Text>
        </View>
        {ITEMS.map(item => (
          <TouchableOpacity
            key={item.route}
            style={[styles.menuItem, item.route === current && styles.menuItemActive]}
            onPress={() => handlePress(item.route)}
          >
            <View style={styles.menuIcon}>{item.icon}</View>
            <Text style={styles.menuItemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  menu: {
    position: 'absolute',
    left: 16,
    width: 252,
    paddingVertical: 6,
    backgroundColor: colors.cardBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  menuHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAlt,
  },
  menuTitle: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    marginHorizontal: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderAlt,
    gap: 12,
  },
  menuItemActive: {
    marginLeft: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    backgroundColor: colors.surfaceAlt,
  },
  menuIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '400',
  },
})
