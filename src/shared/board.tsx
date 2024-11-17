'use client';

import { useEffect, useRef, useState } from 'react';
import { isCardData, isDraggingACard, isDraggingAColumn, TBoard, TCard, TColumn } from './data';
import { Column } from './column';
import invariant from 'tiny-invariant';
import { autoScrollForElements } from '@/pdnd-auto-scroll/entry-point/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

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
      monitorForElements({
        canMonitor: isDraggingACard,
        onDrop({ source, location }) {
          const dragging = source.data;
          if (!isCardData(dragging)) {
            return;
          }

          const innerMost = location.current.dropTargets[0];

          if (!innerMost) {
            return;
          }
          const dropTargetData = innerMost.data;
          const homeColumnIndex = data.columns.findIndex(
            (column) => column.id === dragging.columnId,
          );
          const home: TColumn | undefined = data.columns[homeColumnIndex];

          // should not happen
          if (!home) {
            return;
          }

          // dropping on a card
          if (isCardData(dropTargetData)) {
            const cardIndexInHome = home.cards.findIndex((card) => card.id === dragging.card.id);

            // reordering in home column
            if (home.id === dropTargetData.columnId) {
              const cardFinishIndex = home.cards.findIndex(
                (card) => card.id === dropTargetData.card.id,
              );
              console.log('🤝 Reordering card in same column');

              console.log({ cardIndexInHome, cardFinishIndex, homeColumnIndex });

              // could not find cards needed
              if (cardIndexInHome === -1 || cardFinishIndex === -1) {
                return;
              }

              // no change needed
              if (cardIndexInHome === cardFinishIndex) {
                return;
              }

              const reordered = reorder({
                list: home.cards,
                startIndex: cardIndexInHome,
                finishIndex: cardFinishIndex,
              });

              const updated: TColumn = {
                ...home,
                cards: reordered,
              };
              const columns = Array.from(data.columns);
              columns[homeColumnIndex] = updated;
              setData({ ...data, columns });
              return;
            }

            // moving card from one column to another
            console.log('↔ Moving cards between columns');

            const destinationColumnIndex = data.columns.findIndex(
              (column) => column.id === dropTargetData.columnId,
            );
            const destination = data.columns[destinationColumnIndex];
            // unable to find destination
            if (!destination) {
              return;
            }
            const cardFinishIndex = destination.cards.findIndex(
              (card) => card.id === dropTargetData.card.id,
            );

            // remove card from home list
            const homeCards = Array.from(home.cards);
            homeCards.splice(cardIndexInHome, 1);

            // insert into destination list
            const destinationCards = Array.from(destination.cards);
            destinationCards.splice(cardFinishIndex, 0, dragging.card);

            const updatedHome: TColumn = {
              ...home,
              cards: homeCards,
            };
            const updatedDestination: TColumn = {
              ...destination,
              cards: destinationCards,
            };
            const columns = Array.from(data.columns);
            columns[homeColumnIndex] = updatedHome;
            columns[destinationColumnIndex] = updatedDestination;
            setData({ ...data, columns });
          }
        },
      }),
      monitorForElements({
        canMonitor: isDraggingAColumn,
      }),
      autoScrollForElements({
        canScroll: isDraggingACard,
        getConfiguration: () => ({ maxScrollSpeed: 'fast' }),
        element,
      }),
    );
  }, [data]);

  return (
    <div className="flex h-full flex-row gap-3 overflow-x-auto p-3" ref={scrollableRef}>
      {data.columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
    </div>
  );
}
