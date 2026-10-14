import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Shield, ChevronLeft } from 'lucide-react-native';

import { useAuth } from '@/contexts/Auth/useAuth';
import { TipoUsuario } from '@/types/usuario';
import { colors } from '@/theme/colors';
import { Button } from '@/components/forms/Button';

function getRoleName(tipo?: TipoUsuario) {
  switch (tipo) {
    case TipoUsuario.Curador:
      return 'Curador';
    case TipoUsuario.Operador:
      return 'Operador';
    case TipoUsuario.Identificador:
      return 'Identificador';
    default:
      return 'Usuário';
  }
}

export function UserProfileScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth(); // TODO: O fluxo real de logout também chamará logOut() desse contexto futuramente

  function handleLogout() {
    // TODO: Implementar fluxo real de logout (remover tokens, limpar estado, etc)
    console.log('Logout pressionado');
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={10}
        >
          <ChevronLeft color={colors.textPrimary} size={28} />
        </Pressable>

        <Text style={styles.headerTitle}>Perfil do Usuário</Text>

        {/* Placeholder para balancear o layout (ícone da esquerda) */}
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* AVATAR E NOME */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <User color={colors.onAccent} size={48} />
          </View>
          <Text style={styles.userName}>{user?.nome || 'Nome não disponível'}</Text>
        </View>

        {/* INFORMAÇÕES */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Mail color={colors.textSecondary} size={20} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>E-mail</Text>
                <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Shield color={colors.textSecondary} size={20} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Cargo / Permissão</Text>
                <Text style={styles.infoValue}>{getRoleName(user?.tipo_usuario_id)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* BOTÃO DE LOGOUT */}
        <View style={styles.actionSection}>
          <Button
            title="Sair / Logout"
            variant="secondary"
            icon="logout" // MaterialDesignIcons
            onPress={handleLogout}
          />
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

  /* CABEÇALHO */
  header: {
    height: 72,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },

  /* CONTEÚDO */
  content: {
    padding: 24,
  },

  /* AVATAR SECTION */
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },

  /* INFO SECTION */
  infoSection: {
    marginBottom: 40,
  },
  infoCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderAlt,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderAlt,
    marginLeft: 52, // alinha com o texto, pulando o ícone
  },

  /* ACTIONS */
  actionSection: {
    marginTop: 'auto',
  },
});
