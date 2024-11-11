'use client';

import { useDeferredValue, useEffect, useState } from 'react';

function FPSMeter() {
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const deferredValue = useDeferredValue(displayValue);

  useEffect(() => {
    let last: number | null = null;
    let frameId: number | null = null;
    const values: number[] = [];
    function schedule() {
      frameId = requestAnimationFrame((current) => {
        frameId = null;

        // we initially don't have a `last` value
        if (last == null) {
          last = current;
          schedule();
          return;
        }

        const diff = current - last;
        last = current;

        const fps = 1000 / diff;
        values.push(fps);

        if (values.length === 60) {
          console.count('update');
          const sum = values.reduce((acc, current) => acc + current, 0);
          const average = sum / values.length;
          const rounded = Math.round(average);
          values.length = 0;
          setDisplayValue(rounded);
        }

        schedule();
      });
    }

    schedule();

    return function cleanup() {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return <div>FPS: {deferredValue}</div>;
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
    </div>
  );
}
