'use client';

import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Copy, Ellipsis, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';

import { autoScrollForElements } from '@/pdnd-auto-scroll/entry-point/element';
import { unsafeOverflowAutoScrollForElements } from '@/pdnd-auto-scroll/entry-point/unsafe-overflow/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { Card } from './card';
import { isCardData, isDraggingACard, TCardData, TColumn } from './data';

type TColumnState =
  | {
      type: 'is-card-over';
      card: TCardData;
    }
  | {
      type: 'idle';
    };

const columnStateStyles: { [Key in TColumnState['type']]: string } = {
  idle: '',
  'is-card-over': 'outline outline-2 outline-neutral-50',
};

const idleColumnState = { type: 'idle' } satisfies TColumnState;

export function Column({ column }: { column: TColumn }) {
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TColumnState>(idleColumnState);

  useEffect(() => {
    const outer = outerRef.current;
    const scrollable = scrollableRef.current;
    invariant(outer);
    invariant(scrollable);
    return combine(
      dropTargetForElements({
        element: outer,
        canDrop: isDraggingACard,
        getIsSticky: () => true,
        onDragStart({ source }) {
          console.log('drag start: column');
          if (!isCardData(source.data)) {
            return;
          }
          setState({ type: 'is-card-over', card: source.data });
        },
        onDragEnter({ source }) {
          if (!isCardData(source.data)) {
            return;
          }
          setState({ type: 'is-card-over', card: source.data });
        },
        onDragLeave() {
          setState(idleColumnState);
        },
        onDrop() {
          console.log('column on drop');
          setState(idleColumnState);
        },
      }),
      autoScrollForElements({
        canScroll: isDraggingACard,
        element: scrollable,
      }),
      unsafeOverflowAutoScrollForElements({
        element: scrollable,
        canScroll: isDraggingACard,
        getOverflow() {
          return {
            fromTopEdge: {
              top: 1000,
              right: 0,
              left: 0,
            },
            fromBottomEdge: {
              bottom: 1000,
              right: 0,
              left: 0,
            },
          };
        },
      }),
    );
  }, []);

  return (
    <div className="flex w-80 flex-shrink-0 select-none flex-col" ref={outerRef}>
      <div
        className={`flex max-h-full flex-col rounded-lg bg-slate-800 text-neutral-50 ${columnStateStyles[state.type]}`}
      >
        <div className="flex flex-row items-center justify-between p-3 pb-2">
          <div className="pl-2 font-bold leading-4">{column.title}</div>
          <button type="button" className="rounded p-2 hover:bg-slate-700 active:bg-slate-600">
            <Ellipsis size={16} />
          </button>
        </div>
        <div
          className="flex flex-col gap-3 overflow-y-auto p-3 py-1 [overflow-anchor:none] [scrollbar-color:theme(colors.slate.600)_theme(colors.slate.700)] [scrollbar-width:thin]"
          ref={scrollableRef}
        >
          {column.cards.map((card, index) => (
            <Card key={card.id} card={card} index={index} />
          ))}
        </div>
        <div className="flex flex-row gap-2 p-3">
          <button
            type="button"
            className="flex flex-grow flex-row gap-1 rounded p-2 hover:bg-slate-700 active:bg-slate-600"
          >
            <Plus size={16} />
            <div className="leading-4">Add a card</div>
          </button>
          <button type="button" className="rounded p-2 hover:bg-slate-700 active:bg-slate-600">
            <Copy size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
