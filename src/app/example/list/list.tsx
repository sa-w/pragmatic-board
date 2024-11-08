'use client';

import { Card, getCards, TCard } from '@/shared/card';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';

function Item({ card }: { card: TCard }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const element = ref.current;
    invariant(element);
    return draggable({
      element,
    });
  }, []);
  return <Card ref={ref} card={card} />;
}

export function List() {
  const [cards] = useState<TCard[]>(() => getCards({ amount: 10 }));

  useEffect(() => {});

  return (
    <div>
      {cards.map((card) => (
        <Item key={card.id} card={card} />
      ))}
    </div>
  );
}
