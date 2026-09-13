import { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

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
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.eyeIcon}>{visible ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      )}
    />
  )
}

const styles = StyleSheet.create({
  eyeButton: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
})
