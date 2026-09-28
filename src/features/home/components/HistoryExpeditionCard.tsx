import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Expedition } from '../types';

interface Props {
  expedition: Expedition;
}

export function ExpeditionCard({ expedition }: Props) {
  const isFinalizada = expedition.status === 'Finalizada';

  return (
    <View style={styles.card}>
      {/* Topo do card: Nome à esquerda e Status à direita */}
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>
          {expedition.name}
        </Text>

        <View style={[styles.badge, isFinalizada && styles.badgeFinalizada]}>
          <Text style={[styles.badgeText, isFinalizada && styles.badgeTextFinalizada]}>
            {expedition.status}
          </Text>
        </View>
      </View>

      {/* Linha de Data */}
      <View style={styles.infoRow}>
        <Image
          source={require('../../../assets/icons/calendar.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.infoText}>{expedition.date}</Text>
      </View>

      {/* Linha de Local */}
      <View style={styles.infoRow}>
        <Image
          source={require('../../../assets/icons/pin.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.infoText}>{expedition.location}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#0F2E1D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#274936',
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: '#E9EDE9',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#1FAD5A1A',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeFinalizada: {
    backgroundColor: '#1FAD5A1A',
  },
  badgeText: {
    color: '#1FAD5A',
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextFinalizada: {
    color: '#1FAD5A',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 14,
    height: 14,
    tintColor: '#819888',
  },
  infoText: {
    color: '#819888',
    fontSize: 13,
  },
});