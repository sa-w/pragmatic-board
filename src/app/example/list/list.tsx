'use client';

import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';
import { createPortal } from 'react-dom';

import { ReactElement } from 'react';
import { Apple } from 'lucide-react';

type TCard = {
  id: string;
  icon: ReactElement;
  description: string;
  backgroundColor: string;
  avatarColor: string;
};

function getCards({ amount }: { amount: number }): TCard[] {
  return Array.from({ length: amount }, (_, index) => {
    const card: TCard = {
      id: `card:${index}`,
      description: `Card: ${index}`,
      icon: <Apple />,
      backgroundColor: 'bg-purple-100',
      avatarColor: 'bg-orange-200',
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
      closestEdge: Edge;
    }
  | {
      type: 'preview';
      container: HTMLElement;
      rect: DOMRect;
    };

const idle: TCardState = { type: 'idle' };

const stateStyles: { [Key in TCardState['type']]?: string } = {
  dragging: 'bg-slate-100',
  preview: 'bg-blue-100',
};

function Card({ card }: { card: TCard }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TCardState>(idle);
  useEffect(() => {
    const element = ref.current;
    invariant(element);
    return draggable({
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
    });
  }, []);
  return (
    <>
      <div
        ref={ref}
        className={`rounded border p-2 ${card.backgroundColor} ${stateStyles[state.type]}`}
      >
        <div className="flex flex-row items-center gap-2">
          <div className={`${card.avatarColor} rounded-full p-2`}>{card.icon}</div>
          <div>{card.description}</div>
        </div>
      </div>
      {state.type === 'preview' ? createPortal(<Card card={card} />, state.container) : null}
    </>
  );
}

export function List() {
  const [cards] = useState<TCard[]>(() => getCards({ amount: 10 }));

  useEffect(() => {});

  return (
    <div className="flex h-[50vh] w-80 flex-col gap-2 overflow-y-scroll rounded border p-2">
      {cards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </div>
  );
}
