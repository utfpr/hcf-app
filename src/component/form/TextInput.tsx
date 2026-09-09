import { ReactNode } from "react"
import {
  TextInput as ReactNativeTextInput,
  TextInputProps as ReactNativeTextInputProps,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  Text
} from "react-native"

export interface TextInputProps extends Omit<ReactNativeTextInputProps, 'style'> {
  label?: ReactNode
  style?: StyleProp<TextStyle>
}

export function TextInput({ label, style, ...rest }: TextInputProps) {
  const renderLabel = () => {
    const type = typeof label
    if (type === 'string' || type === 'number') {
      return <Text>{label}</Text>
    }
    return label
  }

  return (
    <View>
      {renderLabel()}
      <ReactNativeTextInput
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    color: '#1b211d',
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
})