'use client';

import { useDeferredValue, useEffect, useState } from 'react';

type State =
  | {
      type: 'initializing';
      frameId: number;
    }
  | {
      type: 'running';
      frameId: number;
      lastFrameTime: number;
      fpsValues: number[];
    };

function FPSMeter() {
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const deferredValue = useDeferredValue(displayValue);

  useEffect(() => {
    let state: State = {
      type: 'initializing',
      frameId: requestAnimationFrame((current) => {
        state = {
          type: 'running',
          fpsValues: [],
          lastFrameTime: current,
          frameId: schedule(),
        };
      }),
    };

    function schedule() {
      return requestAnimationFrame((current) => {
        if (state.type !== 'running') {
          return;
        }

        const diff = current - state.lastFrameTime;
        const fps = 1000 / diff;
        const fpsValues = [...state.fpsValues, fps];

        if (fpsValues.length >= 10) {
          const sum = fpsValues.reduce((acc, current) => acc + current, 0);
          const average = sum / fpsValues.length;
          const rounded = Math.round(average);
          fpsValues.length = 0;
          setDisplayValue(rounded);
        }

        state = {
          type: 'running',
          fpsValues: fpsValues,
          lastFrameTime: current,
          frameId: schedule(),
        };
      });
    }

    return function cleanup() {
      cancelAnimationFrame(state.frameId);
    };
  }, []);

  return <div>FPS: {deferredValue ?? 'pending'}</div>;
}

function CPUBlocker() {
  useEffect(() => {
    function block() {
      console.log('hurting CPU');
      const start = Date.now();
      while (Date.now() - start < 50) {
        // block CPU
      }
    }

    const timerId = setInterval(block);

    return function cleanup() {
      clearInterval(timerId);
    };
  }, []);

  return null;
}

export function Settings() {
  return (
    <div className="fixed right-0 top-0 flex flex-col gap-2 rounded-bl bg-slate-400 p-2">
      <form className="">
        <fieldset>
          <legend>Settings</legend>
          <label className="flex flex-row gap-1">
            <input type="checkbox" name="is-enabled" />
            <label htmlFor="is-enabled">Is custom auto scrolling enabled?</label>
          </label>
        </fieldset>
      </form>
      <FPSMeter />
      {/* <CPUBlocker /> */}
    </div>
  );
}
