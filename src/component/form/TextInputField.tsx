import { View, Text } from "react-native";
import { TextInput } from "./TextInput";


export interface TextInputFieldProps {
  label: string
}

export function TextInputField({
  label
}: TextInputFieldProps) {
  return (
    <View>
      <Text>{label}</Text>
      <TextInput />
    </View>
  )
}
