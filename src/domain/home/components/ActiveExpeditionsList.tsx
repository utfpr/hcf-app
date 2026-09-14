import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Expedition } from '../types';
import { ActiveExpeditionCard } from './ActiveExpeditionCard';

interface Props {
  expeditions: Expedition[];
  loading?: boolean;
  onPressExpedition?: (expedition: Expedition) => void;
}

export function ActiveExpeditionsList({
  expeditions,
  loading,
  onPressExpedition,
}: Props) {
  if (loading && expeditions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#1FAD5A" />
      </View>
    );
  }

  if (expeditions.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          Nenhuma expedição ativa no momento.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {expeditions.map(item => (
        <ActiveExpeditionCard
          key={item.id}
          expedition={item}
          onPress={onPressExpedition}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 14,
  },
  centerContainer: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#0F2E1D40',
    borderWidth: 1,
    borderColor: '#27493640',
    marginVertical: 14,
    padding: 16,
  },
  emptyText: {
    color: '#819888',
    fontSize: 14,
    textAlign: 'center',
  },
});
