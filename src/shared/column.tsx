'use client';

import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { CSSProperties, forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';
import { Copy, Ellipsis, Plus } from 'lucide-react';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

import {
  autoScrollForElements,
  autoScrollWindowForElements,
} from '@/pdnd-auto-scroll/entry-point/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { isSafari } from '@/shared/is-safari';
import { unsafeOverflowAutoScrollForElements } from '@/pdnd-auto-scroll/entry-point/unsafe-overflow/element';
import { TCard, TColumn } from './types';

type TCardState =
  | {
      type: 'idle';
    }
  | {
      type: 'is-dragging';
    }
  | {
      type: 'is-over';
    }
  | {
      type: 'preview';
      container: HTMLElement;
      dragging: DOMRect;
    };

const idle: TCardState = { type: 'idle' };

const stateStyles: { [Key in TCardState['type']]?: string } = {
  idle: 'bg-slate-700 hover:border-current cursor-grab',
  'is-dragging': 'bg-slate-700 opacity-40',
  preview: 'bg-slate-700 bg-blue-100',
  'is-over': 'bg-slate-950 opacity-40',
};

const CardInner = forwardRef<
  HTMLDivElement,
  {
    card: TCard;
    state: TCardState;
  }
>(function CardInner({ card, state }, ref) {
  return (
    <div
      ref={ref}
      className={`flex-shrink-0 rounded border border-transparent p-2 text-slate-300 ${stateStyles[state.type]}`}
      style={
        state.type === 'preview'
          ? {
              width: state.dragging.width,
              height: state.dragging.height,
              transform: !isSafari() ? 'rotate(4deg)' : undefined,
            }
          : undefined
      }
    >
      <div className={`${state.type === 'is-over' ? 'invisible' : ''}`}>{card.description}</div>
    </div>
  );
});

const cardKey = Symbol('card');
type TCardData = {
  [cardKey]: true;
  card: TCard;
};

function getCardData({ card }: Omit<TCardData, typeof cardKey>): TCardData {
  return {
    [cardKey]: true,
    card,
  };
}

function isCardData(value: Record<string | symbol, unknown>): value is TCardData {
  return Boolean(value[cardKey]);
}

function isDraggingACard({
  source,
}: {
  source: { data: Record<string | symbol, unknown> };
}): boolean {
  return isCardData(source.data);
}

function Card({ card, index }: { card: TCard; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TCardState>(idle);
  useEffect(() => {
    const element = ref.current;
    invariant(element);
    return combine(
      draggable({
        element,
        getInitialData: () => getCardData({ card }),
        onGenerateDragPreview({ nativeSetDragImage, location, source }) {
          const data = source.data;
          invariant(isCardData(data));
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({ element, input: location.current.input }),
            render({ container }) {
              setState({
                type: 'preview',
                container,
                dragging: element.getBoundingClientRect(),
              });
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
        element,
        getIsSticky: () => true,
        canDrop: isDraggingACard,
        getData: () => getCardData({ card }),
        onDragEnter({ source }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.id === card.id) {
            return;
          }
          setState({ type: 'is-over' });
        },
        onDragLeave({ source }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.id === card.id) {
            return;
          }
          setState(idle);
        },
        onDrop() {
          setState(idle);
        },
      }),
    );
  }, [card, index]);
  return (
    <>
      <CardInner ref={ref} state={state} card={card} />
      {state.type === 'preview'
        ? createPortal(<CardInner state={state} card={card} />, state.container)
        : null}
    </>
  );
}

export function Column({ column }: { column: TColumn }) {
  // const [cards, setCards] = useState<TCard[]>(() => getCards({ amount: 5 }));
  const scrollableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = scrollableRef.current;
    invariant(element);
    return combine(
      dropTargetForElements({
        element,
        canDrop: isDraggingACard,
        getIsSticky: () => true,
        onDrop({ source, location }) {
          console.log('column on drop');
          const dragging = source.data;
          if (!isCardData(dragging)) {
            return;
          }

          const innerMostDropTarget = location.current.dropTargets[0];

          if (!innerMostDropTarget) {
            return;
          }

          const dropTargetData = innerMostDropTarget.data;

          if (!isCardData(dropTargetData)) {
            return;
          }

          console.log('on drop');
          // setCards((current) => {
          //   const startIndex = current.findIndex((card) => card.id === dragging.card.id);
          //   const finishIndex = current.findIndex((card) => card.id === dropTargetData.card.id);

          //   if (startIndex === -1 || finishIndex === -1) {
          //     return current;
          //   }

          //   // shortcut: no change required
          //   if (startIndex === finishIndex) {
          //     return current;
          //   }

          //   console.log('reorder', {
          //     dragging: dragging.card.id,
          //     dropTarget: dropTargetData.card.id,
          //     startIndex,
          //     finishIndex,
          //   });

          //   return reorder({
          //     list: current,
          //     startIndex,
          //     finishIndex,
          //   });
          // });
        },
      }),
      autoScrollForElements({
        canScroll: isDraggingACard,
        element,
      }),
      unsafeOverflowAutoScrollForElements({
        element,
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
      autoScrollWindowForElements({
        canScroll: isDraggingACard,
      }),
    );
  }, []);

  return (
    <div className="flex h-full w-80 select-none flex-col bg-red-200">
      <div className="flex max-h-full flex-col rounded-lg bg-slate-800 text-slate-300">
        <div className="flex flex-row items-center justify-between p-3">
          <div className="pl-2 font-bold leading-4">{column.title}</div>
          <button type="button" className="rounded p-2 hover:bg-slate-700 active:bg-slate-600">
            <Ellipsis size={16} />
          </button>
        </div>
        <div
          className="grid flex-shrink gap-3 overflow-y-auto p-3 pt-0 [overflow-anchor:none] [scrollbar-color:theme(colors.slate.600)_theme(colors.slate.700)] [scrollbar-width:thin]"
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
      {/* <div className="min-h-0 flex-shrink basis-full">Filler</div> */}
    </div>
  );
}
