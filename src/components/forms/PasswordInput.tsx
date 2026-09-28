import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons'
import { useState } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { TextInput, TextInputProps } from './TextInput'

type PasswordInputProps = Omit<TextInputProps, 'secureTextEntry' | 'accessory'>

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextInput
      {...props}
      secureTextEntry={!visible}
      autoComplete={props.autoComplete ?? 'password'}
      textContentType={props.textContentType ?? 'password'}
      accessory={(
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setVisible((current) => !current)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}>
          <MaterialDesignIcons
            name={visible ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#6B7280"
          />
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  eyeButton: {
    paddingLeft: 8,
  },
})
