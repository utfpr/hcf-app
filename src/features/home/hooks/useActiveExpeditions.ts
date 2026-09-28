import { useContainer } from '@/contexts/Container/useContainer';
import { useQuery } from '@/hooks/query/useQuery';
import { Expedition } from '../types';
import { MOCK_ACTIVE_EXPEDITIONS } from '../expeditions-mock';

export function useActiveExpeditions() {
  const { httpClient } = useContainer();

  const query = useQuery(
    async () => {
      try {
        // Rota que será disponibilizada pelo grupo do backend
        const { data } = await httpClient.get<Expedition[]>(
          '/expeditions/active',
        );
        return Array.isArray(data) && data.length > 0
          ? data
          : MOCK_ACTIVE_EXPEDITIONS;
      } catch {
        // Fallback para mock enquanto o backend está em desenvolvimento
        return MOCK_ACTIVE_EXPEDITIONS;
      }
    },
    ['/expeditions/active'],
  );

  return {
    expeditions: query.data ?? MOCK_ACTIVE_EXPEDITIONS,
    loading: query.loading,
    error: query.error,
    validating: query.validating,
  };
}
