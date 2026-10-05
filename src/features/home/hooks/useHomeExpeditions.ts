import { useCallback, useEffect, useMemo } from 'react';
import { AppState } from 'react-native';

import { useAuth } from '@/contexts/Auth/useAuth';
import { useContainer } from '@/contexts/Container/useContainer';
import { ExpedicaoService } from '@/features/expedition/ExpedicaoService';
import { useQuery } from '@/hooks/query/useQuery';

import { HomeExpeditions, splitExpeditions, toApiDate } from '../mapExpeditions';

// A home mostra tudo em uma tela só; acima disso será preciso paginar
const HOME_EXPEDITIONS_LIMIT = 100;

const EMPTY: HomeExpeditions = { active: [], history: [] };

/** Expedições em que o usuário logado participa, separadas em ativas e histórico */
export function useHomeExpeditions() {
  const { httpClient } = useContainer();
  const { user } = useAuth();
  const service = useMemo(() => new ExpedicaoService(httpClient), [httpClient]);
  const userId = user?.id;

  const fetcher = useCallback(
    () => service.listar({
      usuario_id: userId,
      limite: HOME_EXPEDITIONS_LIMIT,
    }),
    [service, userId],
  );

  const query = useQuery(fetcher, userId ? ['home-expeditions', userId] : null);
  const { refresh } = query;

  // Recalculado a cada render: se o app ficar aberto de um dia para o outro, a expedição
  // que terminou ontem passa para o histórico mesmo que a API devolva os mesmos dados
  const today = toApiDate(new Date());

  const expeditions = useMemo(
    () => (query.data ? splitExpeditions(query.data.itens, today) : EMPTY),
    [query.data, today],
  );

  // Ao voltar do segundo plano, busca de novo (e re-renderiza com a data atual)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  return {
    ...expeditions,
    loading: query.loading,
    refreshing: query.validating && !query.loading,
    error: query.error,
    refresh,
  };
}
