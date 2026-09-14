import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExpeditionCard } from './components/HistoryExpeditionCard';
import { ActiveExpeditionsList } from './components/ActiveExpeditionsList';
import { useActiveExpeditions } from './hooks/useActiveExpeditions';
import { MOCK_HISTORY_EXPEDITIONS } from './expeditions-mock';
import { Expedition } from './types';

export function Home() {
  const insets = useSafeAreaInsets();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { expeditions: activeExpeditions, loading: loadingActive } =
    useActiveExpeditions();

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

        <Text style={styles.userName}>
          Dr. Silva
        </Text>
      </View>

      {/* =========================
          CONTEÚDO
      ========================== */}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>
          Expedições Ativas
        </Text>

        <ActiveExpeditionsList
          expeditions={activeExpeditions}
          loading={loadingActive}
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
              {MOCK_HISTORY_EXPEDITIONS.map(item => (
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