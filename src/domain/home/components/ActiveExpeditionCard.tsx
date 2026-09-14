import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Expedition } from '../types';

interface Props {
  expedition: Expedition;
  onPress?: (expedition: Expedition) => void;
}

export function ActiveExpeditionCard({ expedition, onPress }: Props) {
  const isPlanejada = expedition.status === 'Planejada';
  const isFinalizada = expedition.status === 'Finalizada';

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
      <View
        style={[
          styles.badge,
          isPlanejada && styles.badgePlanejada,
          isFinalizada && styles.badgeFinalizada,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isPlanejada && styles.badgeTextPlanejada,
            isFinalizada && styles.badgeTextFinalizada,
          ]}
        >
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
  badgePlanejada: {
    backgroundColor: '#27493680',
  },
  badgeFinalizada: {
    backgroundColor: '#1FAD5A1A',
  },
  badgeText: {
    color: '#1FAD5A',
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextPlanejada: {
    color: '#81C784',
  },
  badgeTextFinalizada: {
    color: '#819888',
  },
});
