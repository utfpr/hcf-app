import React, { useState } from 'react';
import {
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

import { OfflineBanner } from '@/components/OfflineBanner';
import { useAuth } from '@/contexts/Auth/useAuth';
import { getHttpErrorMessage, isNetworkError } from '@/libraries/http/httpError';
import { RootStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { NavigationMenu } from '@/features/navigation/NavigationMenu';

import { ActiveExpeditionsList } from './components/ActiveExpeditionsList';
import { CollapsibleExpeditionSection } from './components/CollapsibleExpeditionSection';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const {
    active,
    future,
    history,
    loading,
    refreshing,
    error,
    refresh,
  } = useHomeExpeditions();

  function handleExpeditionPress(expedition: Expedition) {
    navigation.navigate('ExpeditionDetail', { expeditionId: expedition.id });
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* =========================
          CABEÇALHO
      ========================== */}

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={styles.menuButton}
            onPress={() => setIsMenuOpen(true)}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Abrir menu de navegação"
          >
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </Pressable>

          <Text style={styles.userName} numberOfLines={1}>
            {user?.nome}
          </Text>
        </View>
      </View>

      <OfflineBanner />

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

        {/* Expedições futuras e histórico */}

        <View style={styles.collapsibleSections}>
          <CollapsibleExpeditionSection
            title="Expedições Futuras"
            expeditions={future}
            loading={loading}
            emptyText="Nenhuma expedição planejada."
            onPressExpedition={handleExpeditionPress}
          />

          <CollapsibleExpeditionSection
            title="Histórico de Expedições"
            expeditions={history}
            loading={loading}
            emptyText="Nenhuma expedição finalizada."
            onPressExpedition={handleExpeditionPress}
          />
        </View>
      </ScrollView>

      <NavigationMenu
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        current="Home"
        headerHeight={styles.header.height}
      />
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

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },


  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.bell,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: colors.background,
    fontSize: 10,
    fontWeight: '700',
  },

  menuButton: {
    width: 44,
    height: 44,

    justifyContent: 'center',

    gap: 7,
  },

  menuLine: {
    width: 28,
    height: 3,

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
     FUTURAS E HISTÓRICO
  ========================== */

  collapsibleSections: {
    gap: 12,
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
