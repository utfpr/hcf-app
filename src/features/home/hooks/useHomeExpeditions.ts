import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { statusDaExpedicao } from '@/features/offline/mesclagem';
import { useOffline } from '@/features/offline/OfflineContext';
import { useQuery } from '@/hooks/query/useQuery';

import { HomeExpeditions, splitExpeditions, toApiDate } from '../mapExpeditions';

const EMPTY: HomeExpeditions = { active: [], future: [], history: [] };

/** Expedições em que o usuário logado participa (salvas no aparelho), separadas em ativas, futuras e histórico */
export function useHomeExpeditions() {
  const { store, baixar, baixando } = useOffline();
  const [erroBaixa, setErroBaixa] = useState<Error | undefined>();

  const fetcher = useCallback(async () => {
    const [cache, pendencias] = await Promise.all([store.lerExpedicoes(), store.pendencias()]);
    const minhas = new Set(cache.minhas);
    return {
      itens: cache.itens.filter(item => minhas.has(item.id)),
      pendencias,
    };
  }, [store]);

  const query = useQuery(fetcher, ['home-expeditions', store.usuarioId]);
  const { refresh: reler } = query;

  // Recalculado a cada render: se o app ficar aberto de um dia para o outro, a expedição
  // que terminou ontem passa para o histórico mesmo que os dados sejam os mesmos
  const today = toApiDate(new Date());

  const expeditions = useMemo(() => {
    if (!query.data) return EMPTY;
    const { itens, pendencias } = query.data;
    return splitExpeditions(itens, today, id => statusDaExpedicao(pendencias, id));
  }, [query.data, today]);

  // O RefreshControl precisa de refreshing=true já no onRefresh; senão o indicador some
  // e volta quando a baixa (que antes checa a conexão) começa, parecendo vários reloads
  const [puxando, setPuxando] = useState(false);

  // Puxar para atualizar: baixa da API se houver conexão; sem conexão, só relê o aparelho.
  // Depois de uma baixa as telas já releem sozinhas (um aviso só, no fim)
  const refresh = useCallback(async () => {
    setPuxando(true);
    try {
      const resultado = await baixar();
      setErroBaixa(resultado.success || !resultado.message ? undefined : new Error(resultado.message));
      if (!resultado.success) await reler();
    } finally {
      setPuxando(false);
    }
  }, [baixar, reler]);

  // Ao voltar do segundo plano, relê o aparelho (e re-renderiza com a data atual)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') reler();
    });
    return () => subscription.remove();
  }, [reler]);

  const vazio = expeditions.active.length === 0
    && expeditions.future.length === 0
    && expeditions.history.length === 0;

  return {
    ...expeditions,
    loading: query.loading || (baixando && vazio),
    refreshing: puxando || (baixando && !vazio),
    // Sem nada no aparelho, o erro da baixa explica a tela vazia
    error: vazio ? erroBaixa ?? query.error : query.error,
    refresh,
  };
}
