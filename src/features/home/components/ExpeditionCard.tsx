import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { Expedition, ExpeditionStatus } from '../types';

interface Props {
  expedition: Expedition;
  onPress?: (expedition: Expedition) => void;
}

// Único ponto em que o card muda conforme o status: as cores do badge
const STATUS_STYLES: Record<ExpeditionStatus, { badge: ViewStyle; text: TextStyle }> = {
  'Em andamento': { badge: {}, text: {} },
  Planejada: { badge: { backgroundColor: '#27493680' }, text: { color: '#81C784' } },
  Finalizada: { badge: { backgroundColor: '#1FAD5A1A' }, text: { color: '#819888' } },
};

/** Card de expedição usado na Home (ativas e histórico) e na listagem */
export function ExpeditionCard({ expedition, onPress }: Props) {
  const statusStyle = STATUS_STYLES[expedition.status];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() => onPress?.(expedition)}
    >
      {/* Título da expedição */}
      <Text style={styles.title} numberOfLines={2}>
        {expedition.name}
      </Text>

      {/* Detalhes: Data e Localização */}
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Image
            source={require('../../../assets/icons/calendar.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.infoText} numberOfLines={1}>
            {expedition.date}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Image
            source={require('../../../assets/icons/pin.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.infoText} numberOfLines={1}>
            {expedition.location}
          </Text>
        </View>
      </View>

      {/* Badge de Status */}
      <View style={[styles.badge, statusStyle.badge]}>
        <Text style={[styles.badgeText, statusStyle.text]}>
          {expedition.status}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#0F2E1D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#274936',
    padding: 14,
    justifyContent: 'space-between',
    minHeight: 135,
  },
  cardPressed: {
    opacity: 0.8,
    borderColor: '#1FAD5A',
  },
  title: {
    color: '#E9EDE9',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 8,
  },
  infoContainer: {
    gap: 6,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    width: 13,
    height: 13,
    tintColor: '#819888',
  },
  infoText: {
    color: '#819888',
    fontSize: 12,
    flexShrink: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#1FAD5A1A',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    color: '#1FAD5A',
    fontSize: 11,
    fontWeight: '600',
  },
});
