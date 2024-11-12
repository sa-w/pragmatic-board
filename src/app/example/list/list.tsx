'use client';

import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import invariant from 'tiny-invariant';
import { Ellipsis } from 'lucide-react';

import {
  autoScrollForElements,
  autoScrollWindowForElements,
} from '@/pdnd-auto-scroll/entry-point/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';

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
      type: 'dragging';
    }
  | {
      type: 'is-over';
      // closestEdge: Edge;
    }
  | {
      type: 'preview';
      container: HTMLElement;
      rect: DOMRect;
    };

const idle: TCardState = { type: 'idle' };

const stateStyles: { [Key in TCardState['type']]?: string } = {
  idle: 'bg-slate-800',
  dragging: 'bg-slate-100',
  preview: 'bg-blue-100',
  'is-over': 'bg-red-300',
};

function Card({ card }: { card: TCard }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TCardState>(idle);
  useEffect(() => {
    const element = ref.current;
    invariant(element);
    return combine(
      draggable({
        element,
        onGenerateDragPreview({ nativeSetDragImage, location }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({ element, input: location.current.input }),
            render({ container }) {
              const rect = element.getBoundingClientRect();
              const node = element.cloneNode(true);
              invariant(node instanceof HTMLElement);
              node.classList.add('bg-red-400');
              node.style.width = `${rect.width}px`;
              node.style.height = `${rect.height}px`;
              container.appendChild(node);
            },
          });
        },
        onDragStart() {
          setState({ type: 'dragging' });
        },
        onDrop() {
          setState(idle);
        },
      }),
      dropTargetForElements({
        element,
        onDragEnter() {
          setState({ type: 'is-over' });
        },
        onDragLeave() {
          setState(idle);
        },
        onDrop() {
          setState(idle);
        },
      }),
    );
  }, []);
  return (
    <>
      <div
        ref={ref}
        className={`bg-slate-700 text-slate-300 rounded p-2 ${stateStyles[state.type]}`}
      >
        <div>{card.description}</div>
      </div>
      {state.type === 'preview' ? createPortal(<Card card={card} />, state.container) : null}
    </>
  );
}

export function List() {
  const [cards] = useState<TCard[]>(() => getCards({ amount: 80 }));
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
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
    <div
      className="bg-slate-800 text-slate-300 flex h-[50vh] w-80 flex-col overflow-y-scroll rounded p-3"
      ref={ref}
    >
      <div className="flex flex-row items-center justify-between px-2 pb-3">
        <div className="font-bold leading-4">Column title</div>
        <button type="button" className="hover:bg-slate-700 rounded p-2">
          <Ellipsis size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
