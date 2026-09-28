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

import { useAuth } from '@/contexts/Auth/useAuth';
import { getHttpErrorMessage, isNetworkError } from '@/libraries/http/httpError';

import { ExpeditionCard } from './components/HistoryExpeditionCard';
import { ActiveExpeditionsList } from './components/ActiveExpeditionsList';
import { useHomeExpeditions } from './hooks/useHomeExpeditions';
import { Expedition } from './types';

function getLoadErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  return getHttpErrorMessage(error) ?? 'Não foi possível carregar as expedições.';
}

export function HomeScreen() {
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

  function handleExpeditionPress(_expedition: Expedition) {
    // TODO: navegar para os detalhes da expedição
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
            colors={['#1FAD5A']}
            tintColor="#1FAD5A"
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

        <Text style={styles.sectionTitle}>
          Expedições Ativas
        </Text>

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
                <ActivityIndicator size="small" color="#1FAD5A" />
              ) : null}

              {!loading && history.length === 0 ? (
                <Text style={styles.historyEmpty}>
                  Nenhuma expedição finalizada.
                </Text>
              ) : null}

              {history.map(item => (
                <ExpeditionCard key={item.id} expedition={item} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* =========================
          BOTÃO +
      ========================== */}

      <Pressable
        style={styles.addButton}
        onPress={handleAddPress}
        hitSlop={8}
      >
        <Text style={styles.addButtonText}>
          +
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#082113',
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
    borderBottomColor: '#214532',
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

    backgroundColor: '#E8EFEA',
  },

  userName: {
    flexShrink: 1,
    marginLeft: 16,
    color: '#E8EFEA',

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
    borderColor: '#7F1D1D',
    backgroundColor: '#450A0A80',
    gap: 6,
  },

  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
  },

  retryText: {
    color: '#E9EDE9',
    fontSize: 13,
    fontWeight: '700',
  },

  sectionTitle: {
    color: '#E9EDE9',

    fontSize: 20,
    fontWeight: '700',
  },

  /* =========================
     HISTÓRICO
  ========================== */

  historyContainer: {
    borderRadius: 10,
    backgroundColor: '#183927',
    borderWidth: 1,
    borderColor: '#274936',
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
    color: '#E9EDE9',

    fontSize: 14,
    fontWeight: '700',
  },

  chevronWrapper: {
    width: 16,
    height: 16,
  },

  chevronIcon: {
    tintColor: '#E9EDE9',
    width: 16,
    height: 16,
    transform: [{ rotate: '0deg' }],
  },

  chevronClosed: {
    transform: [{ rotate: '-90deg' }],
  },

  historyList: {
    padding: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#274936',
  },

  historyEmpty: {
    color: '#819888',
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

    backgroundColor: '#1FAD5A',

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 6,
  },

  addButtonText: {
    color: '#FFFFFF',

    fontSize: 34,
    fontWeight: '300',

    lineHeight: 38,
  },
});