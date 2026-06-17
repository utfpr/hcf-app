import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';

import { styles } from './styles';

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function AppButton({
  title,
  loading = false,
  variant = 'primary',
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'secondary' && styles.buttonSecondary,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...rest}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'secondary' && styles.textSecondary,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
