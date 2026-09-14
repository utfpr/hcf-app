import { useQuery } from '../../../hook/query/useQuery';
import { useContainer } from '../../../context/container/useContainer';
import { Expedition } from '../types';
import { MOCK_ACTIVE_EXPEDITIONS } from '../expeditions-mock';

export function useActiveExpeditions() {
  const { httpClient } = useContainer();

  const query = useQuery(
    async () => {
      try {
        // Rota que será disponibilizada pelo grupo do backend
        const response = await httpClient.get<Expedition[]>({
          url: '/expeditions/active',
        });
        const data = await response.json();
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
