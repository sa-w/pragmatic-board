'use client';

import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Copy, Ellipsis, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';

import { autoScrollForElements } from '@/pdnd-auto-scroll/entry-point/element';
import { unsafeOverflowAutoScrollForElements } from '@/pdnd-auto-scroll/entry-point/unsafe-overflow/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { Card, CardShadow } from './card';
import {
  getColumnData,
  isCardData,
  isColumnData,
  isDraggingACard,
  isDraggingAColumn,
  TCardData,
  TColumn,
} from './data';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { isSafari } from './is-safari';

type TColumnState =
  | {
      type: 'is-card-over';
      dragging: TCardData;
    }
  | {
      type: 'is-column-over';
    }
  | {
      type: 'idle';
    }
  | {
      type: 'is-dragging';
    };

const stateStyles: { [Key in TColumnState['type']]: string } = {
  idle: 'cursor-grab',
  'is-card-over': 'outline outline-2 outline-neutral-50',
  'is-dragging': 'opacity-40',
  'is-column-over': 'bg-slate-900',
};

const idle = { type: 'idle' } satisfies TColumnState;

export function Column({ column }: { column: TColumn }) {
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const outerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TColumnState>(idle);

  useEffect(() => {
    const outer = outerRef.current;
    const scrollable = scrollableRef.current;
    const header = headerRef.current;
    const inner = innerRef.current;
    invariant(outer);
    invariant(scrollable);
    invariant(header);
    invariant(inner);
    return combine(
      draggable({
        element: header,
        getInitialData: () => getColumnData({ column }),
        onGenerateDragPreview({ source, location, nativeSetDragImage }) {
          const data = source.data;
          invariant(isColumnData(data));
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({ element: header, input: location.current.input }),
            render({ container }) {
              const rect = inner.getBoundingClientRect();
              const preview = inner.cloneNode(true);
              invariant(preview instanceof HTMLElement);
              preview.style.width = `${rect.width}px`;
              preview.style.height = `${rect.height}px`;
              if (!isSafari()) {
                preview.style.transform = 'rotate(4deg)';
              }

              container.appendChild(preview);
            },
          });
        },
        onDragStart() {
          setState({ type: 'is-dragging' });
        },
        onDrop() {
          setState(idle);
        },
      }),
      dropTargetForElements({
        element: outer,
        canDrop({ source }) {
          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getIsSticky: () => true,
        onDragStart({ source }) {
          if (isCardData(source.data)) {
            setState({ type: 'is-card-over', dragging: source.data });
          }
        },
        onDragEnter({ source, self }) {
          if (isCardData(source.data)) {
            setState({ type: 'is-card-over', dragging: source.data });
            return;
          }
          console.log('is column over?');
          if (isColumnData(source.data) && source.data.column.id !== column.id) {
            setState({ type: 'is-column-over' });
          }
        },
        onDragLeave({ source, self }) {
          if (isColumnData(source.data) && source.data.column.id === column.id) {
            return;
          }
          setState(idle);
        },
        onDrop() {
          setState(idle);
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
    <div className="flex w-80 flex-shrink-0 select-none flex-col bg-red-100" ref={outerRef}>
      <div
        className={`flex max-h-full flex-col rounded-lg bg-slate-800 text-neutral-50 ${stateStyles[state.type]}`}
        ref={innerRef}
      >
        {/* Extra wrapping element to make it easy to toggle visibility of content when a column is dragging over */}
        <div
          className={`flex max-h-full flex-col ${state.type === 'is-column-over' ? 'invisible' : ''}`}
        >
          <div className="flex flex-row items-center justify-between p-3 pb-2" ref={headerRef}>
            <div className="pl-2 font-bold leading-4">{column.title}</div>
            <button type="button" className="rounded p-2 hover:bg-slate-700 active:bg-slate-600">
              <Ellipsis size={16} />
            </button>
          </div>
          <div
            className="flex flex-col gap-3 overflow-y-auto p-3 py-1 [overflow-anchor:none] [scrollbar-color:theme(colors.slate.600)_theme(colors.slate.700)] [scrollbar-width:thin]"
            ref={scrollableRef}
          >
            {column.cards.map((card) => (
              <Card key={card.id} card={card} columnId={column.id} />
            ))}
            {state.type === 'is-card-over' && state.dragging.columnId !== column.id ? (
              <CardShadow card={state.dragging.card} />
            ) : null}
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
    </div>
  );
}
