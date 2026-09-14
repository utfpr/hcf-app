import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ActiveExpeditionCard } from '../src/domain/home/components/ActiveExpeditionCard';
import { ActiveExpeditionsList } from '../src/domain/home/components/ActiveExpeditionsList';
import { Expedition } from '../src/domain/home/types';
import { MOCK_ACTIVE_EXPEDITIONS } from '../src/domain/home/expeditions-mock';

describe('ActiveExpeditions', () => {
  const sampleExpedition: Expedition = {
    id: 'test-1',
    name: 'Serra da Canastra',
    date: '15/02/2026',
    location: 'MG – Brasil',
    status: 'Em andamento',
  };

  it('renders ActiveExpeditionCard with correct info', () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(
        <ActiveExpeditionCard expedition={sampleExpedition} />
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
        <ActiveExpeditionsList expeditions={MOCK_ACTIVE_EXPEDITIONS} />
      );
    });

    const root = renderer!.root;
    const cards = root.findAllByType(ActiveExpeditionCard);
    expect(cards.length).toBe(MOCK_ACTIVE_EXPEDITIONS.length);
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
