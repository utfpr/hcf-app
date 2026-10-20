import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '@/theme/colors';

import { Expedition } from '../types';
import { ExpeditionCard } from './ExpeditionCard';

interface Props {
  title: string;
  expeditions: Expedition[];
  loading?: boolean;
  emptyText: string;
  onPressExpedition?: (expedition: Expedition) => void;
}

/** Seção da landing page que abre e fecha (expedições futuras, histórico) */
export function CollapsibleExpeditionSection({
  title,
  expeditions,
  loading,
  emptyText,
  onPressExpedition,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.button}
        onPress={() => setIsOpen(prev => !prev)}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
      >
        <Text style={styles.title}>
          {title}
        </Text>

        <View style={styles.chevronWrapper}>
          <Image
            source={require('../../../assets/icons/chevron-down.png')}
            style={[
              styles.chevronIcon,
              !isOpen && styles.chevronClosed,
            ]}
            resizeMode="contain"
          />
        </View>
      </Pressable>

      {isOpen && (
        <View style={styles.list}>
          {loading && expeditions.length === 0 ? (
            <ActivityIndicator style={styles.loading} size="small" color={colors.accent} />
          ) : null}

          {!loading && expeditions.length === 0 ? (
            <Text style={styles.empty}>
              {emptyText}
            </Text>
          ) : null}

          {expeditions.map(item => (
            <ExpeditionCard key={item.id} expedition={item} onPress={onPressExpedition} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  button: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  title: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },

  chevronWrapper: {
    width: 16,
    height: 16,
  },

  chevronIcon: {
    tintColor: colors.textPrimary,
    width: 16,
    height: 16,
    transform: [{ rotate: '0deg' }],
  },

  chevronClosed: {
    transform: [{ rotate: '-90deg' }],
  },

  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  loading: {
    width: '100%',
  },

  empty: {
    width: '100%',
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
});
