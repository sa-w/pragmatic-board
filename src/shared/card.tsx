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
import { getCardData, isCardData, isDraggingACard, TCard } from './data';

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

const stateStyles: { [Key in TCardState['type']]: string } = {
  idle: 'bg-slate-700 hover:outline outline-2 outline-neutral-50 cursor-grab',
  'is-dragging': 'bg-slate-700 opacity-40',
  preview: 'bg-slate-700 bg-blue-100',
  'is-over': 'bg-slate-900',
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
      className={`flex-shrink-0 rounded p-2 text-slate-300 ${stateStyles[state.type]}`}
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

const isOver: TCardState = { type: 'is-over' };

export function CardShadow({ card }: { card: TCard }) {
  return <CardInner state={isOver} card={card} />;
}

export function Card({ card, columnId }: { card: TCard; columnId: string }) {
  console.log('render', card.id);
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<TCardState>(idle);
  useEffect(() => {
    const element = ref.current;
    invariant(element);
    return combine(
      draggable({
        element,
        getInitialData: () => getCardData({ card, columnId }),
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
        getData: () => getCardData({ card, columnId }),
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
  }, [card, columnId]);
  return (
    <>
      <CardInner ref={ref} state={state} card={card} />
      {state.type === 'preview'
        ? createPortal(<CardInner state={state} card={card} />, state.container)
        : null}
    </>
  );
}
