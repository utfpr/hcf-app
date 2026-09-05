import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '../../hook/query/useQuery';
import { useContainer } from '../../context/container/useContainer';

export function Home() {
  const { httpClient } = useContainer();
  const insets = useSafeAreaInsets();

  const { data, error, loading, validating } = useQuery(
    async () => {
      const response = await httpClient.get<object[]>({
        url: '/posts',
      });

      return response.json();
    },
    ['/posts'],
  );

  console.log(data?.length, error, loading, validating);

  function handleMenuPress() {
    // TODO: navegar para a página do menu
  }

  function handleAddPress() {
    // TODO: navegar para a página de nova expedição
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

      <View style={styles.content}>

        <Text style={styles.sectionTitle}>
          Expedições Ativas
        </Text>

        {/* 
          ESPAÇO RESERVADO PARA OS CARDS.
          
        */}
        <View style={styles.cardsPlaceholder} />

        {/* Histórico de Expedições */}

        <Pressable style={styles.historyButton}>
          <Text style={styles.historyText}>
            Histórico de Expedições
          </Text>

          <Text style={styles.chevron}>
            ⌄
          </Text>
        </Pressable>

      </View>

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

    paddingHorizontal: 24,
    paddingTop: 24,
  },

  sectionTitle: {
    color: '#E8EFEA',

    fontSize: 20,
    fontWeight: '700',
  },

  /*
   * Espaço para os cards
   * de Expedições Ativas.
   */
  cardsPlaceholder: {
    height: 285,
  },

  /* =========================
     HISTÓRICO
  ========================== */

  historyButton: {
    height: 49,

    borderRadius: 8,

    backgroundColor: '#153D29',

    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  historyText: {
    color: '#E8EFEA',

    fontSize: 16,
    fontWeight: '600',
  },

  chevron: {
    color: '#E8EFEA',

    fontSize: 24,

    marginTop: -6,
  },

  /* =========================
     BOTÃO +
  ========================== */

  addButton: {
    position: 'absolute',

    right: 20,
    bottom: 87,

    width: 57,
    height: 57,

    borderRadius: 29,

    backgroundColor: '#19B85A',

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