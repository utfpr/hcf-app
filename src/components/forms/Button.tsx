import {
  MaterialDesignIcons,
  MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export interface ButtonProps {
  title: string
  loading?: boolean
  disabled?: boolean
  variant?: 'primary' | 'secondary'
  /** Ícone exibido à esquerda do título (nomes em https://pictogrammers.com/library/mdi/) */
  icon?: MaterialDesignIconsIconName
  onPress?: () => void
}

export function Button({
  title,
  loading = false,
  disabled,
  variant = 'primary',
  icon,
  onPress,
}: ButtonProps) {
  const isDisabled = disabled || loading
  const contentColor = variant === 'secondary' ? '#00B14F' : '#FFFFFF'

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        isDisabled && styles.buttonDisabled,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <MaterialDesignIcons name={icon} size={20} color={contentColor} style={styles.icon} />
          ) : null}
          <Text style={[styles.text, { color: contentColor }]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#00B14F',
    borderRadius: 8,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00B14F',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
})
