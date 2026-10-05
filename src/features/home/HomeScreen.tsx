import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@/contexts/Auth/useAuth';
import { getHttpErrorMessage, isNetworkError } from '@/libraries/http/httpError';
import { RootStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

import { ExpeditionCard } from './components/ExpeditionCard';
import { ActiveExpeditionsList } from './components/ActiveExpeditionsList';
import { useHomeExpeditions } from './hooks/useHomeExpeditions';
import { Expedition } from './types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

function getLoadErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  return getHttpErrorMessage(error) ?? 'Não foi possível carregar as expedições.';
}

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { user } = useAuth();
  const {
    active,
    history,
    loading,
    refreshing,
    error,
    refresh,
  } = useHomeExpeditions();

  function handleMenuPress() {
    // TODO: navegar para a página do menu
  }

  function handleAddPress() {
    // TODO: navegar para a página de nova expedição
  }

  function handleExpeditionPress(expedition: Expedition) {
    navigation.navigate('ExpeditionDetail', { expeditionId: expedition.id });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* =========================
          CABEÇALHO
      ========================== */}

      <View style={styles.header}>
        <Pressable
          style={styles.menuButton}
          onPress={handleMenuPress}
          hitSlop={10}
        >
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
          <View style={styles.menuLine} />
        </Pressable>

        <Text style={styles.userName} numberOfLines={1}>
          {user?.nome}
        </Text>
      </View>

      {/* =========================
          CONTEÚDO
      ========================== */}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        )}
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{getLoadErrorMessage(error)}</Text>
            <Pressable onPress={refresh} hitSlop={8}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Expedições Ativas
          </Text>

          <Pressable onPress={() => navigation.navigate('ExpeditionList')} hitSlop={8}>
            <Text style={styles.seeAllText}>Ver todas</Text>
          </Pressable>
        </View>

        <ActiveExpeditionsList
          expeditions={active}
          loading={loading}
          onPressExpedition={handleExpeditionPress}
        />

        {/* Histórico de Expedições */}

        <View style={styles.historyContainer}>
          <Pressable
            style={styles.historyButton}
            onPress={() => setIsHistoryOpen(prev => !prev)}
          >
            <Text style={styles.historyText}>
              Histórico de Expedições
            </Text>

            <View style={styles.chevronWrapper}>
              <Image
                source={require('../../assets/icons/chevron-down.png')}
                style={[
                  styles.chevronIcon,
                  !isHistoryOpen && styles.chevronClosed,
                ]}
                resizeMode="contain"
              />
            </View>
          </Pressable>

          {isHistoryOpen && (
            <View style={styles.historyList}>
              {loading && history.length === 0 ? (
                <ActivityIndicator style={styles.historyLoading} size="small" color={colors.accent} />
              ) : null}

              {!loading && history.length === 0 ? (
                <Text style={styles.historyEmpty}>
                  Nenhuma expedição finalizada.
                </Text>
              ) : null}

              {history.map(item => (
                <ExpeditionCard key={item.id} expedition={item} onPress={handleExpeditionPress} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  /* =========================
     CABEÇALHO
  ========================== */

  header: {
    height: 72,
    paddingHorizontal: 24,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  menuButton: {
    width: 32,
    height: 32,

    justifyContent: 'center',

    gap: 5,
  },

  menuLine: {
    width: 20,
    height: 2,

    borderRadius: 2,

    backgroundColor: colors.textPrimary,
  },

  userName: {
    flexShrink: 1,
    marginLeft: 16,
    color: colors.textPrimary,

    fontSize: 16,
    fontWeight: '500',
  },

  /* =========================
     CONTEÚDO
  ========================== */

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 96,
  },

  errorBox: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    backgroundColor: colors.surfaceAlt,
    gap: 6,
  },

  errorText: {
    color: colors.danger,
    fontSize: 13,
  },

  retryText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: colors.textPrimary,

    fontSize: 20,
    fontWeight: '700',
  },

  seeAllText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },

  /* =========================
     HISTÓRICO
  ========================== */

  historyContainer: {
    borderRadius: 10,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  historyButton: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  historyText: {
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

  historyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  historyLoading: {
    width: '100%',
  },

  historyEmpty: {
    width: '100%',
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },

  /* =========================
     BOTÃO +
  ========================== */

  addButton: {
    position: 'absolute',

    right: 20,
    bottom: 87,

    width: 56,
    height: 56,

    borderRadius: 29,

    backgroundColor: colors.accent,

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 6,
  },

  addButtonText: {
    color: colors.onAccent,

    fontSize: 34,
    fontWeight: '300',

    lineHeight: 38,
  },
});
