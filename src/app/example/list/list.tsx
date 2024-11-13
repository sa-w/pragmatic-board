'use client';

import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';
import { Ellipsis } from 'lucide-react';

import {
  autoScrollForElements,
  autoScrollWindowForElements,
} from '@/pdnd-auto-scroll/entry-point/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { isSafari } from '@/shared/is-safari';

type TCard = {
  id: string;
  description: string;
};

function getCards({ amount }: { amount: number }): TCard[] {
  return Array.from({ length: amount }, (_, index) => {
    const card: TCard = {
      id: `card:${index}`,
      description: `Card: ${index}`,
    };

    return card;
  });
}

type TCardState =
  | {
      type: 'idle';
    }
  | {
      type: 'is-dragging';
    }
  | {
      type: 'is-over';
      rect: DOMRect;
    }
  | {
      type: 'preview';
      container: HTMLElement;
      rect: DOMRect;
    };

const idle: TCardState = { type: 'idle' };

const stateStyles: { [Key in TCardState['type']]?: string } = {
  idle: 'bg-slate-700 hover:border-current cursor-grab',
  'is-dragging': 'bg-slate-700 opacity-40',
  preview: 'bg-slate-700 bg-blue-100',
  'is-over': 'bg-slate-700',
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
      className={`rounded border border-transparent p-2 text-slate-300 ${stateStyles[state.type]}`}
      style={
        state.type === 'preview'
          ? {
              width: state.rect.width,
              height: state.rect.height,
              transform: !isSafari() ? 'rotate(4deg)' : undefined,
            }
          : state.type === 'is-over'
            ? {
                transform: `translateY(calc(-${state.rect.height}px - 0.75rem)`,
                pointerEvents: 'none',
                height: state.rect.height,
                width: state.rect.width,
              }
            : undefined
      }
    >
      <div>{card.description}</div>
      {/* TODO: shadow for item being dragged */}
    </div>
  );
});

const cardKey = Symbol('card');
type TCardData = {
  [cardKey]: true;
  card: TCard;
  rect: DOMRect;
};

function getCardData({ card, rect }: { card: TCard; rect: DOMRect }): TCardData {
  return {
    [cardKey]: true,
    card,
    rect,
  };
}

function isCardData(value: Record<string | symbol, unknown>): value is TCardData {
  return Boolean(value[cardKey]);
}

function Card({ card }: { card: TCard }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TCardState>(idle);
  useEffect(() => {
    const element = ref.current;
    invariant(element);
    return combine(
      draggable({
        element,
        getInitialData: ({ element }) =>
          getCardData({ card, rect: element.getBoundingClientRect() }),
        onGenerateDragPreview({ nativeSetDragImage, location }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({ element, input: location.current.input }),
            render({ container }) {
              setState({
                type: 'preview',
                container,
                rect: element.getBoundingClientRect(),
              });
              // const rect = element.getBoundingClientRect();
              // const node = element.cloneNode(true);
              // invariant(node instanceof HTMLElement);
              // node.classList.add('bg-red-400');
              // node.style.width = `${rect.width}px`;
              // node.style.height = `${rect.height}px`;
              // container.appendChild(node);
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
        canDrop: ({ source }) => isCardData(source.data),
        onDragEnter({ source }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.id === card.id) {
            return;
          }
          setState({ type: 'is-over', rect: source.data.rect });
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
  }, [card]);
  return (
    <>
      <CardInner ref={ref} state={state} card={card} />
      {state.type === 'preview'
        ? createPortal(<CardInner state={state} card={card} />, state.container)
        : null}
    </>
  );
}

export function Column() {
  const [cards] = useState<TCard[]>(() => getCards({ amount: 80 }));
  const scrollableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = scrollableRef.current;
    invariant(element);
    return combine(
      dropTargetForElements({
        element,
      }),
      autoScrollForElements({
        element,
      }),
      autoScrollWindowForElements(),
    );
  }, []);

  return (
    <div className="flex h-[50vh] w-80 flex-col rounded bg-slate-800 text-slate-300">
      <div className="flex flex-row items-center justify-between px-5 py-3">
        <div className="font-bold leading-4">Column title</div>
        <button type="button" className="rounded p-2 hover:bg-slate-700">
          <Ellipsis size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-3 overflow-y-scroll p-3 pt-0" ref={scrollableRef}>
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
