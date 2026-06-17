import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from './styles';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export function AppInput({
  label,
  error,
  showPasswordToggle = false,
  secureTextEntry,
  ...rest
}: AppInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isSecure = secureTextEntry && !passwordVisible;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          secureTextEntry={isSecure}
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          {...rest}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setPasswordVisible((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.eyeIcon}>{passwordVisible ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
