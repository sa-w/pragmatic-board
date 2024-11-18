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

import { isSafari } from '@/shared/is-safari';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { getCardData, isCardData, isDraggingACard, TCard, TCardData } from './data';
import {
  type Edge,
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';

type TCardState =
  | {
      type: 'idle';
    }
  | {
      type: 'is-dragging';
    }
  | {
      type: 'is-dragging-left-self';
    }
  | {
      type: 'is-over';
      dragging: DOMRect;
      closestEdge: Edge;
    }
  | {
      type: 'preview';
      container: HTMLElement;
      dragging: DOMRect;
    };

const idle: TCardState = { type: 'idle' };

const stateStyles: { [Key in TCardState['type']]: string } = {
  idle: 'bg-slate-700 hover:outline outline-2 outline-neutral-50 cursor-grab',
  'is-dragging': 'bg-slate-700 opacity-40',
  'is-dragging-left-self': '',
  preview: 'bg-slate-700 bg-blue-100',
  'is-over': 'bg-slate-700',
};

export function CardShadow({ dragging }: { dragging: DOMRect }) {
  return <div className="flex-shrink-0 rounded bg-slate-900" style={{ height: dragging.height }} />;
}

const CardInner = forwardRef<
  HTMLDivElement,
  {
    card: TCard;
    state: TCardState;
  }
>(function CardInner({ card, state }, ref) {
  return (
    <div ref={ref} className="flex flex-shrink-0 flex-col gap-3">
      {state.type === 'is-over' && state.closestEdge === 'top' ? (
        <CardShadow dragging={state.dragging} />
      ) : null}
      <div
        className={`rounded p-2 text-slate-300 ${stateStyles[state.type]}`}
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
        <div>{card.description}</div>
      </div>
      {state.type === 'is-over' && state.closestEdge === 'bottom' ? (
        <CardShadow dragging={state.dragging} />
      ) : null}
    </div>
  );
});

export function Card({ card, columnId }: { card: TCard; columnId: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TCardState>(idle);
  useEffect(() => {
    const element = ref.current;
    invariant(element);
    return combine(
      draggable({
        element,
        getInitialData: ({ element }) =>
          getCardData({ card, columnId, rect: element.getBoundingClientRect() }),
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
        // TODO: avoid needing to re-compute rect
        getData: ({ element, input }) => {
          const data = getCardData({ card, columnId, rect: element.getBoundingClientRect() });
          return attachClosestEdge(data, { element, input, allowedEdges: ['top', 'bottom'] });
        },
        onDragEnter({ source, self }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.id === card.id) {
            return;
          }
          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) {
            console.log('no closest edge');
            return;
          }

          console.log({ closestEdge });
          setState({ type: 'is-over', dragging: source.data.rect, closestEdge });
        },
        onDrag({ source, self }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.id === card.id) {
            return;
          }
          const closestEdge = extractClosestEdge(self.data);
          if (!closestEdge) {
            console.log('no closest edge');
            return;
          }

          console.log({ closestEdge });
          setState({ type: 'is-over', dragging: source.data.rect, closestEdge });
        },
        onDragLeave({ source }) {
          if (!isCardData(source.data)) {
            return;
          }
          if (source.data.card.id === card.id) {
            setState({ type: 'is-dragging-left-self' });
            return;
          }
          setState(idle);
        },
        onDrop() {
          setState(idle);
        },
      }),
    );
  }, [card, columnId]);
  return (
    <>
      {state.type === 'is-dragging-left-self' ? null : (
        <CardInner ref={ref} state={state} card={card} />
      )}
      {state.type === 'preview'
        ? createPortal(<CardInner state={state} card={card} />, state.container)
        : null}
    </>
  );
}
