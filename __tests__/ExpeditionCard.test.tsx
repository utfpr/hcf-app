import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ExpeditionCard } from '../src/features/home/components/ExpeditionCard';
import { ActiveExpeditionsList } from '../src/features/home/components/ActiveExpeditionsList';
import { Expedition } from '../src/features/home/types';

describe('ActiveExpeditions', () => {
  const sampleExpedition: Expedition = {
    id: 'test-1',
    name: 'Serra da Canastra',
    date: '15/02/2026',
    location: 'MG – Brasil',
    status: 'Em andamento',
  };

  const expeditions: Expedition[] = [
    sampleExpedition,
    { ...sampleExpedition, id: 'test-2', name: 'Chapada dos Veadeiros', status: 'Planejada' },
  ];

  it('renders ExpeditionCard with correct info', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <ExpeditionCard expedition={sampleExpedition} />
      );
    });

    const root = renderer!.root;
    expect(root.findByProps({ children: 'Serra da Canastra' })).toBeDefined();
    expect(root.findByProps({ children: '15/02/2026' })).toBeDefined();
    expect(root.findByProps({ children: 'MG – Brasil' })).toBeDefined();
    expect(root.findByProps({ children: 'Em andamento' })).toBeDefined();
  });

  it('renders ActiveExpeditionsList with all items', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <ActiveExpeditionsList expeditions={expeditions} />
      );
    });

    const root = renderer!.root;
    const cards = root.findAllByType(ExpeditionCard);
    expect(cards.length).toBe(expeditions.length);
  });

  it('renders empty message when there are no expeditions', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <ActiveExpeditionsList expeditions={[]} />
      );
    });

    const root = renderer!.root;
    expect(
      root.findByProps({ children: 'Nenhuma expedição ativa no momento.' })
    ).toBeDefined();
  });
});
