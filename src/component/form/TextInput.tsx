import { ReactNode } from "react"
import {
  TextInput as ReactNativeTextInput,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
  Text
} from "react-native"

export interface TextInputProps {
  label?: ReactNode
  placeholder?: string
  style?: StyleProp<TextStyle>
}

export function TextInput(props: TextInputProps) {
  const renderLabel = () => {
    const type = typeof props.label
    if (type === 'string' || type === 'number') {
      return <Text>{props.label}</Text>
    }
    return props.label
  }

  return (
    <View>
      {renderLabel()}
      <ReactNativeTextInput
        style={styles.input}
          {...props}
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
