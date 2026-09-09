import { View, Text } from "react-native";
import { TextInput, TextInputProps } from "./TextInput";

export interface TextInputFieldProps extends TextInputProps {
  label: string
}

export function TextInputField({
  label,
  ...rest
}: TextInputFieldProps) {
  return (
    <View>
      <Text>{label}</Text>
      <TextInput {...rest} />
    </View>
  )
}