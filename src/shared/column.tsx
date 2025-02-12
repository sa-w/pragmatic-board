'use client';

import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Copy, Ellipsis, Plus } from 'lucide-react';
import { memo, useContext, useEffect, useRef, useState } from 'react';
import invariant from 'tiny-invariant';

import { autoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/element';
import { unsafeOverflowAutoScrollForElements } from '@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { DragLocationHistory } from '@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types';
import { preserveOffsetOnSource } from '@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { Cards, CardShadow } from './card';
import {
  getColumnData,
  isCardData,
  isCardDropTargetData,
  isColumnData,
  isDraggingACard,
  isDraggingAColumn,
  TCard,
  TCardData,
  TColumn,
} from './data';
import { blockBoardPanningAttr } from './data-attributes';
import { isSafari } from './is-safari';
import { isShallowEqual } from './is-shallow-equal';
import { SettingsContext } from './settings-context';
import { InputBase, SnackbarCloseReason } from '@mui/material';
import SimpleSnackbar from './simpleSnackBar';

import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import { Button } from '@mui/material';
import BasicMenu from './basicMenu';
import Card from '@mui/material/Card';

import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import React from 'react';

type TColumnState =
  | {
    type: 'is-card-over';
    isOverChildCard: boolean;
    dragging: DOMRect;
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

interface HandleClose {
  (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason): void;
}

//re render state chenges to card
const CardList = (function CardList({ column }: { column: TColumn }) {
  return column.cards.map((card) => <Cards key={card.id} card={card} columnId={column.id} />);
});

export function Column({ column }: { column: TColumn }) {
  const scrollableRef = useRef<HTMLDivElement | null>(null);
  const outerFullHeightRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const { settings } = useContext(SettingsContext);
  const [state, setState] = useState<TColumnState>(idle);
  const [value, setValue] = useState("");
  const [activeColumn, setActiveColumn] = useState(column);
  const [key, setKey] = useState(0);
  const taskInputRef = useRef<HTMLInputElement | null>(null);
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState("")

  const handleCloseAlert: HandleClose = (
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
    setValue(event.currentTarget.value);
    console.log("Input value:", event.currentTarget.value);
  };

  useEffect(() => {
    const outer = outerFullHeightRef.current;
    const scrollable = scrollableRef.current;
    const header = headerRef.current;
    const inner = innerRef.current;
    invariant(outer);
    invariant(scrollable);
    invariant(header);
    invariant(inner);

    let data = getColumnData({ column });

    function setIsCardOver({ data, location }: { data: TCardData; location: DragLocationHistory }) {
      const innerMost = location.current.dropTargets[0];
      const isOverChildCard = Boolean(innerMost && isCardDropTargetData(innerMost.data));

      const proposed: TColumnState = {
        type: 'is-card-over',
        dragging: data.rect,
        isOverChildCard,
      };
      // optimization - don't update state if we don't need to.
      setState((current) => {
        if (isShallowEqual(proposed, current)) {
          return current;
        }
        return proposed;
      });
    }

    return combine(
      draggable({
        element: header,
        getInitialData: () => data,
        onGenerateDragPreview({ source, location, nativeSetDragImage }) {
          const data = source.data;
          invariant(isColumnData(data));
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({ element: header, input: location.current.input }),
            render({ container }) {
              // Simple drag preview generation: just cloning the current element.
              // Not using react for this.
              const rect = inner.getBoundingClientRect();
              const preview = inner.cloneNode(true);
              invariant(preview instanceof HTMLElement);
              preview.style.width = `${rect.width}px`;
              preview.style.height = `${rect.height}px`;

              // rotation of native drag previews does not work in safari
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
        getData: () => data,
        canDrop({ source }) {
          return isDraggingACard({ source }) || isDraggingAColumn({ source });
        },
        getIsSticky: () => true,
        onDragStart({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location });
          }
        },
        onDragEnter({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location });
            return;
          }
          if (isColumnData(source.data) && source.data.column.id !== column.id) {
            setState({ type: 'is-column-over' });
          }
        },
        onDropTargetChange({ source, location }) {
          if (isCardData(source.data)) {
            setIsCardOver({ data: source.data, location });
            return;
          }
        },
        onDragLeave({ source }) {
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
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false;
          }

          return isDraggingACard({ source });
        },
        getConfiguration: () => ({ maxScrollSpeed: settings.columnScrollSpeed }),
        element: scrollable,
      }),
      unsafeOverflowAutoScrollForElements({
        element: scrollable,
        getConfiguration: () => ({ maxScrollSpeed: settings.columnScrollSpeed }),
        canScroll({ source }) {
          if (!settings.isOverElementAutoScrollEnabled) {
            return false;
          }

          if (!settings.isOverflowScrollingEnabled) {
            return false;
          }

          return isDraggingACard({ source });
        },
        getOverflow() {
          return {
            forTopEdge: {
              top: 1000,
            },
            forBottomEdge: {
              bottom: 1000,
            },
          };
        },
      }),
    );
  }, [column, settings]);

  function addTask() {
    let tempCards: TCard[] = column.cards;
    /*if(tempCards.length >= 5 ){
      setMessage("You can not have more than 5 tasks")
      setShow(true)
    }else {*/
    let newTempCard: TCard = {
      id: `${value}-${Date.now()}`, description: value
    }
    tempCards.push(newTempCard);
    let tempColumns = activeColumn;
    tempColumns.cards = tempCards
    column = tempColumns
    //setActiveColumn(tempColumns)
    setKey((k) => k + 1)
    if (taskInputRef.current) {
      console.log("Task added:", taskInputRef.current.value);
      taskInputRef.current.value = ""; // Reset input
    }
    //}

  }

  function rename(name: string){
    column.title = name;
    setKey((k) => k + 1)
  }

  function clear(){
    column.cards = [];
    setKey((k) => k + 1)
  }

  function deleteColumn(){
    
    

  }


  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <><SimpleSnackbar close={handleCloseAlert} message={message} show={show} /><div className="flex w-72 flex-shrink-0 select-none flex-col" ref={outerFullHeightRef}>
      <div
        className={`flex max-h-full flex-col rounded-lg bg-slate-800 text-neutral-50 ${stateStyles[state.type]}`}
        ref={innerRef}
        {...{ [blockBoardPanningAttr]: true }}
      >
        {/* Extra wrapping element to make it easy to toggle visibility of content when a column is dragging over */}
        <div
          className={`flex max-h-full flex-col ${state.type === 'is-column-over' ? 'invisible' : ''}`}
        >
          {/*<div className="flex flex-row items-center justify-between p-3 pb-2" ref={headerRef}>
            <div className="pl-2 font-bold leading-4">{column.title}</div>
            <button
              type="button"
              className="rounded p-2 hover:bg-slate-700 active:bg-slate-600"
              aria-label="More actions"
            >
              <Ellipsis size={16} />
            </button>
          </div>*/}

          <Card sx={{ maxWidth: 345 }} >
            <BasicMenu anchorEl={anchorEl} open={open} handleClose={handleClose} rename={function (name: string): void {
              throw new Error('Function not implemented.');
            } } clear={clear} />
            <CardHeader className=" border-b flex flex-row items-center justify-between p-3 pb-2" ref={headerRef}
              action={<IconButton aria-label="settings" onClick={handleClick}>
                <MoreVertIcon />
              </IconButton>}
              title={column.title} />

            <CardContent > 
              <div
                className="flex flex-col overflow-y-auto [overflow-anchor:none] [scrollbar-color:theme(colors.slate.600)_theme(colors.slate.700)] [scrollbar-width:thin]"
                ref={scrollableRef}
              >
                <CardList column={column} />
                {state.type === 'is-card-over' && !state.isOverChildCard ? (
                  <div className="flex-shrink-0 px-3 py-1">
                    <CardShadow dragging={state.dragging} />
                  </div>
                ) : null}
              </div>
              <div className="flex flex-row gap-2 p-3">
                <InputBase
                  sx={{ ml: 1, flex: 1, color: 'black' }}
                  placeholder="Add a task"
                  inputProps={{ "aria-label": "Add a task" }}
                  onKeyUp={handleKeyUp}
                  inputRef={taskInputRef} />
              </div>
              {/*<div className="flex flex-row gap-2 p-3">*/}

            {/*<button
              type="button"
              className="flex flex-grow flex-row gap-1 rounded p-2 hover:bg-slate-700 active:bg-slate-600"
              onClick={addTask}
            >
              <Plus size={16} />
              <div className="leading-4">Add a task</div>
            </button>*/}



            </CardContent>


            <CardActions className="border-t" disableSpacing sx={{ border: 'darkgray' }}>
              
              <Button sx={{ margin: 'auto' }} onClick={addTask} variant="text">Add Card</Button>
              
            </CardActions>
           

          </Card>
          {/*</div>*/}

        </div>
      </div>
    </div>
  </>
  );
}
