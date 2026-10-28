import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { ReactNode } from 'react'
import {
  StyleSheet,
  Text,
  TextInput as ReactNativeTextInput,
  View,
} from 'react-native'

export interface TextInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  onBlur?: () => void
  error?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address'
  autoComplete?: 'email' | 'password' | 'off'
  textContentType?: 'emailAddress' | 'password'
  accessory?: ReactNode
}

export function TextInput({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoComplete,
  textContentType,
  accessory,
}: TextInputProps) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <ReactNativeTextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCapitalize="none"
        />
        {accessory}
      </View>
      {error ? (
        <View style={styles.errorRow}>
          <MaterialDesignIcons name="alert-circle-outline" size={14} color={ERROR_TEXT_COLOR} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  )
}

const ERROR_TEXT_COLOR = '#FCA5A5'

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 52,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 15,
    paddingVertical: 0,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: ERROR_TEXT_COLOR,
    fontSize: 12,
    marginLeft: 4,
  },
})
