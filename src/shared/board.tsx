'use client';

import { useEffect, useRef, useState } from 'react';
import { isDraggingACard, TBoard, TCard, TColumn } from './data';
import { Column } from './column';
import invariant from 'tiny-invariant';
import { autoScrollForElements } from '@/pdnd-auto-scroll/entry-point/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';

function getInitialData(): TBoard {
  // Doing this so we get consistent ids on server and client
  const getCards = (() => {
    let count: number = 0;

    return function getCards({ amount }: { amount: number }): TCard[] {
      return Array.from({ length: amount }, (): TCard => {
        const id = count++;
        return {
          id: `card:${id}`,
          description: `Card ${id}`,
        };
      });
    };
  })();

  const columns: TColumn[] = [
    { id: 'column:a', title: 'Column A', cards: getCards({ amount: 60 }) },
    { id: 'column:b', title: 'Column B', cards: getCards({ amount: 4 }) },
    { id: 'column:c', title: 'Column C', cards: getCards({ amount: 4 }) },
    { id: 'column:d', title: 'Column D', cards: getCards({ amount: 4 }) },
    { id: 'column:e', title: 'Column E', cards: getCards({ amount: 4 }) },
    { id: 'column:f', title: 'Column F', cards: getCards({ amount: 4 }) },
    { id: 'column:g', title: 'Column G', cards: getCards({ amount: 4 }) },
    { id: 'column:h', title: 'Column H', cards: getCards({ amount: 4 }) },
    { id: 'column:i', title: 'Column I', cards: getCards({ amount: 4 }) },
  ];

  return {
    columns,
  };
}

export function Board() {
  const [data, setData] = useState(() => getInitialData());
  const scrollableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = scrollableRef.current;
    invariant(element);
    console.log('setting up auto scrolling');
    return combine(
      autoScrollForElements({
        canScroll: isDraggingACard,
        getConfiguration: () => ({ maxScrollSpeed: 'fast' }),
        element,
      }),
    );
  }, []);

  return (
    <div className="flex h-full flex-row gap-3 overflow-x-auto p-3" ref={scrollableRef}>
      {data.columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
    </div>
  );
}
