'use client';

import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import { useContext, useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';
import { Column } from './column';
import {
  isCardData,
  isCardDropTargetData,
  isColumnData,
  isDraggingACard,
  isDraggingAColumn,
  TBoard,
  TCard,
  TColumn,
} from './data';
import { SettingsContext } from './settings-context';
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
import { bindAll } from 'bind-event-listener';
import { blockBoardPanningAttr } from './data-attributes';
import { CleanupFn } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import { Button, SnackbarCloseReason } from '@mui/material';
import SimpleSnackbar from './simpleSnackBar';

interface HandleClose {
  (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason): void;
}


export function Board({ initial }: { initial: TBoard }) {
  const [data, setData] = useState(initial);
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const { settings } = useContext(SettingsContext);
  const [inputValue, setInputValue] = useState("");
  const [key, setKey] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState("")

  const handleClose: HandleClose = (
    event,
    reason
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setMessage("")
    setShow(false)
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value);
    console.log("Input value:", event.currentTarget.value);
  };

  useEffect(() => {
    const element = scrollableRef.current;
    invariant(element);
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

          if (!home) {
            return;
          }
          const cardIndexInHome = home.cards.findIndex((card) => card.id === dragging.card.id);

          // dropping on a card
          if (isCardDropTargetData(dropTargetData)) {
            const destinationColumnIndex = data.columns.findIndex(
              (column) => column.id === dropTargetData.columnId,
            );
            const destination = data.columns[destinationColumnIndex];
            // reordering in home column
            if (home === destination) {
              const cardFinishIndex = home.cards.findIndex(
                (card) => card.id === dropTargetData.card.id,
              );

              // could not find cards needed
              if (cardIndexInHome === -1 || cardFinishIndex === -1) {
                return;
              }

              // no change needed
              if (cardIndexInHome === cardFinishIndex) {
                return;
              }

              const closestEdge = extractClosestEdge(dropTargetData);

              const reordered = reorderWithEdge({
                axis: 'vertical',
                list: home.cards,
                startIndex: cardIndexInHome,
                indexOfTarget: cardFinishIndex,
                closestEdgeOfTarget: closestEdge,
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

            // unable to find destination
            if (!destination) {
              return;
            }

            const indexOfTarget = destination.cards.findIndex(
              (card) => card.id === dropTargetData.card.id,
            );

            const closestEdge = extractClosestEdge(dropTargetData);
            const finalIndex = closestEdge === 'bottom' ? indexOfTarget + 1 : indexOfTarget;

            // remove card from home list
            const homeCards = Array.from(home.cards);
            homeCards.splice(cardIndexInHome, 1);

            // insert into destination list
            const destinationCards = Array.from(destination.cards);
            destinationCards.splice(finalIndex, 0, dragging.card);

            const columns = Array.from(data.columns);
            columns[homeColumnIndex] = {
              ...home,
              cards: homeCards,
            };
            columns[destinationColumnIndex] = {
              ...destination,
              cards: destinationCards,
            };
            setData({ ...data, columns });
            return;
          }

          // dropping onto a column, but not onto a card
          if (isColumnData(dropTargetData)) {
            const destinationColumnIndex = data.columns.findIndex(
              (column) => column.id === dropTargetData.column.id,
            );
            const destination = data.columns[destinationColumnIndex];

            if (!destination) {
              return;
            }

            // dropping on home
            if (home === destination) {
              console.log('moving card to home column');

              // move to last position
              const reordered = reorder({
                list: home.cards,
                startIndex: cardIndexInHome,
                finishIndex: home.cards.length - 1,
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

            console.log('moving card to another column');

            // remove card from home list

            const homeCards = Array.from(home.cards);
            homeCards.splice(cardIndexInHome, 1);

            // insert into destination list
            const destinationCards = Array.from(destination.cards);
            destinationCards.splice(destination.cards.length, 0, dragging.card);

            const columns = Array.from(data.columns);
            columns[homeColumnIndex] = {
              ...home,
              cards: homeCards,
            };
            columns[destinationColumnIndex] = {
              ...destination,
              cards: destinationCards,
            };
            setData({ ...data, columns });
            setKey((k) => k + 1)
            return;
          }
        },
      }),
      monitorForElements({
        canMonitor: isDraggingAColumn,
        onDrop({ source, location }) {
          const dragging = source.data;
          if (!isColumnData(dragging)) {
            return;
          }

          const innerMost = location.current.dropTargets[0];

          if (!innerMost) {
            return;
          }
          const dropTargetData = innerMost.data;

          if (!isColumnData(dropTargetData)) {
            return;
          }

          const homeIndex = data.columns.findIndex((column) => column.id === dragging.column.id);
          const destinationIndex = data.columns.findIndex(
            (column) => column.id === dropTargetData.column.id,
          );

          if (homeIndex === -1 || destinationIndex === -1) {
            return;
          }

          if (homeIndex === destinationIndex) {
            return;
          }

          const reordered = reorder({
            list: data.columns,
            startIndex: homeIndex,
            finishIndex: destinationIndex,
          });
          setData({ ...data, columns: reordered });
        },
      }),
      autoScrollForElements({
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false;
          }

          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getConfiguration: () => ({ maxScrollSpeed: settings.boardScrollSpeed }),
        element,
      }),
      unsafeOverflowAutoScrollForElements({
        element,
        getConfiguration: () => ({ maxScrollSpeed: settings.boardScrollSpeed }),
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false;
          }

          if (!settings.isOverflowScrollingEnabled) {
            return false;
          }

          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getOverflow() {
          return {
            forLeftEdge: {
              top: 1000,
              left: 1000,
              bottom: 1000,
            },
            forRightEdge: {
              top: 1000,
              right: 1000,
              bottom: 1000,
            },
          };
        },
      }),
    );
  }, [data, key, settings]);

  // Panning the board
  useEffect(() => {
    let cleanupActive: CleanupFn | null = null;
    const scrollable = scrollableRef.current;
    invariant(scrollable);

    function begin({ startX }: { startX: number }) {
      let lastX = startX;

      const cleanupEvents = bindAll(
        window,
        [
          {
            type: 'pointermove',
            listener(event) {
              const currentX = event.clientX;
              const diffX = lastX - currentX;

              lastX = currentX;
              scrollable?.scrollBy({ left: diffX });
            },
          },
          // stop panning if we see any of these events
          ...(
            [
              'pointercancel',
              'pointerup',
              'pointerdown',
              'keydown',
              'resize',
              'click',
              'visibilitychange',
            ] as const
          ).map((eventName) => ({ type: eventName, listener: () => cleanupEvents() })),
        ],
        // need to make sure we are not after the "pointerdown" on the scrollable
        // Also this is helpful to make sure we always hear about events from this point
        { capture: true },
      );

      cleanupActive = cleanupEvents;
    }

    const cleanupStart = bindAll(scrollable, [
      {
        type: 'pointerdown',
        listener(event) {
          if (!(event.target instanceof HTMLElement)) {
            return;
          }
          // ignore interactive elements
          if (event.target.closest(`[${blockBoardPanningAttr}]`)) {
            return;
          }

          begin({ startX: event.clientX });
        },
      },
    ]);

    return function cleanupAll() {
      cleanupStart();
      cleanupActive?.();
    };
  }, []);

  function addColumn() {
    let tempCards: TCard[] = []
    let tempColumns: TColumn = {
      id: `${inputValue}-${Date.now()}`, title: inputValue, cards: tempCards
    }
    let tempData = data.columns

    if (tempData.length >= 5) {
      setMessage("You can not have more than 5 columns")
      setShow(true)
    } else {

      tempData.push(tempColumns)
      let listTempColumns: TColumn[] = tempData;
      let tempBoard: TBoard = { columns: listTempColumns }
      setData(tempBoard)
      if (inputRef.current) {
        console.log("Column added:", inputRef.current.value);
        inputRef.current.value = ""; // Reset input
      }

    }


  }

  return (
    <><SimpleSnackbar close={handleClose} message={message} show={show} /><div className={`flex h-full flex-col ${settings.isBoardMoreObvious ? 'px-32 py-20' : ''}`}>

      <div
        className={`flex h-full flex-row gap-3 overflow-x-auto p-3 [scrollbar-color:theme(colors.sky.600)_theme(colors.sky.800)] [scrollbar-width:thin] ${settings.isBoardMoreObvious ? 'rounded border-2 border-dashed' : ''}`}
        ref={scrollableRef}
      >

        {data.columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}

        {data.columns.length >= 5 ? null :<span>            <Paper
          component="form"
          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 'auto' }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Column name"
            inputProps={{ "aria-label": "Column name" }}
            inputRef={inputRef}
            onKeyUp={handleKeyUp} /><span><Button variant="text" onClick={addColumn}>Add Column</Button></span>

        </Paper></span>} 
      </div>
    </div></>
  );
}


