import type { ExpedicaoListItem } from '../src/features/expedition/types';
import { splitExpeditions, toApiDate } from '../src/features/home/mapExpeditions';

function item(overrides: Partial<ExpedicaoListItem>): ExpedicaoListItem {
  return {
    id: 1,
    descricao: 'Expedição',
    data_inicio: '2026-09-20',
    data_fim: '2026-09-30',
    cidade_id: 1,
    cidade_nome: 'Campo Mourão',
    estado_sigla: 'PR',
    created_at: '2026-09-01T00:00:00.000Z',
    updated_at: '2026-09-01T00:00:00.000Z',
    created_by: 1,
    updated_by: null,
    participantes: [],
    rotas: [],
    ...overrides,
  };
}

const TODAY = '2026-09-27';

describe('splitExpeditions', () => {
  it('separa ativas e histórico pela data de fim e define o status', () => {
    const { active, history } = splitExpeditions(
      [
        item({ id: 1, data_inicio: '2026-09-20', data_fim: '2026-10-05' }),
        item({ id: 2, data_inicio: '2026-10-12', data_fim: '2026-10-20' }),
        item({ id: 3, data_inicio: '2026-08-10', data_fim: '2026-08-14' }),
      ],
      TODAY,
    );

    expect(active.map(e => [e.id, e.status])).toEqual([
      ['1', 'Em andamento'],
      ['2', 'Planejada'],
    ]);
    expect(history.map(e => [e.id, e.status])).toEqual([['3', 'Finalizada']]);
  });

  it('considera ativa a expedição que começa ou termina hoje', () => {
    const { active, history } = splitExpeditions(
      [
        item({ id: 1, data_inicio: TODAY, data_fim: '2026-10-01' }),
        item({ id: 2, data_inicio: '2026-09-01', data_fim: TODAY }),
      ],
      TODAY,
    );

    expect(active.map(e => e.status)).toEqual(['Em andamento', 'Em andamento']);
    expect(history).toHaveLength(0);
  });

  it('move para o histórico no dia seguinte ao fim', () => {
    const expedicao = item({ id: 1, data_inicio: '2026-09-25', data_fim: '2026-10-05' });

    const ultimoDia = splitExpeditions([expedicao], '2026-10-05');
    expect(ultimoDia.active.map(e => e.status)).toEqual(['Em andamento']);
    expect(ultimoDia.history).toHaveLength(0);

    const diaSeguinte = splitExpeditions([expedicao], '2026-10-06');
    expect(diaSeguinte.active).toHaveLength(0);
    expect(diaSeguinte.history.map(e => e.status)).toEqual(['Finalizada']);
  });

  it('ordena ativas pelo início e histórico pelo fim mais recente', () => {
    const { active, history } = splitExpeditions(
      [
        item({ id: 1, data_inicio: '2026-11-03', data_fim: '2026-11-10' }),
        item({ id: 2, data_inicio: '2026-09-25', data_fim: '2026-09-30' }),
        item({ id: 3, data_inicio: '2026-02-09', data_fim: '2026-02-13' }),
        item({ id: 4, data_inicio: '2026-08-10', data_fim: '2026-08-14' }),
      ],
      TODAY,
    );

    expect(active.map(e => e.id)).toEqual(['2', '1']);
    expect(history.map(e => e.id)).toEqual(['4', '3']);
  });

  it('formata nome, data e local para o card', () => {
    const { active } = splitExpeditions(
      [item({ id: 7, descricao: '  Pantanal Norte ', data_inicio: '2026-10-12', data_fim: '2026-10-20' })],
      TODAY,
    );

    expect(active[0]).toEqual({
      id: '7',
      name: 'Pantanal Norte',
      date: '12/10/2026',
      location: 'Campo Mourão – PR',
      status: 'Planejada',
    });
  });

  it('usa textos padrão quando faltam descrição ou local', () => {
    const [expedition] = splitExpeditions(
      [item({ id: 9, descricao: null, cidade_nome: null, estado_sigla: null })],
      TODAY,
    ).active;

    expect(expedition.name).toBe('Expedição #9');
    expect(expedition.location).toBe('Local não informado');
  });
});

describe('toApiDate', () => {
  it('usa a data local, sem converter para UTC', () => {
    // 23h do dia 27 no horário local: em UTC (Brasília) já seria dia 28
    expect(toApiDate(new Date(2026, 8, 27, 23, 30))).toBe('2026-09-27');
    expect(toApiDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
