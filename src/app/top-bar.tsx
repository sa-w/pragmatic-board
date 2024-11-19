'use client';

import { SettingsContext, TBooleanField, TSelectField, TSettings } from '@/shared/settings';
import { bindAll } from 'bind-event-listener';
import { PanelTopClose, PanelTopOpen, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';
import { FPSPanel } from './fps-panel';

type TLink = { title: string; href: string };

const links: TLink[] = [
  { title: 'Board', href: '/board' },
  { title: 'One column', href: '/one-column' },
  { title: 'Two columns', href: '/two-columns' },
];

function BooleanField({
  field,
  fieldKey,
  settings,
}: {
  field: TBooleanField;
  fieldKey: keyof TSettings;
  settings: TSettings;
}) {
  const { update } = useContext(SettingsContext);
  return (
    <label className="flex flex-row gap-2 rounded border p-2">
      <div className="flex flex-col">
        <span className="font-bold">{field.title}</span>
        <span className="text-balance text-sm">{field.description}</span>
      </div>
      <input
        type="checkbox"
        checked={field.value}
        disabled={
          field.dependsOnBooleanField
            ? settings[field.dependsOnBooleanField].value === false
              ? true
              : false
            : false
        }
        onChange={() => update({ key: fieldKey, value: !field.value })}
      />
    </label>
  );
}

function SelectField({
  field,
  fieldKey,
  settings,
}: {
  field: TSelectField<any>;
  fieldKey: keyof TSettings;
  settings: TSettings;
}) {
  const { update } = useContext(SettingsContext);
  return (
    <div className="flex flex-col gap-2 rounded border p-2">
      <span className="font-bold">{field.title}</span>
      <span className="text-balance text-sm">{field.description}</span>
      <select
        className="rounded p-2"
        value={field.value}
        disabled={
          field.dependsOnBooleanField
            ? settings[field.dependsOnBooleanField].value === false
              ? true
              : false
            : false
        }
        onChange={(event) => update({ key: fieldKey, value: event.target.value as any })}
      >
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const [isTopBarExpanded, setIsTopBarExpanded] = useState<boolean>(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const settingsDialogRef = useRef<HTMLDivElement | null>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const { settings } = useContext(SettingsContext);

  useEffect(() => {
    return bindAll(window, [
      {
        type: 'keydown',
        listener(event) {
          if (event.key !== 'Escape') {
            return;
          }

          if (isSettingsOpen) {
            setIsSettingsOpen(false);
            return;
          }
          setIsTopBarExpanded((current) => !current);
        },
      },
      {
        type: 'click',
        listener(event) {
          if (!(event.target instanceof Element)) {
            return;
          }

          if (!isSettingsOpen) {
            return;
          }

          const dialog = settingsDialogRef.current;
          const trigger = settingsTriggerRef.current;
          if (!dialog || !trigger) {
            return;
          }
          if (trigger.contains(event.target)) {
            return;
          }

          if (dialog.contains(event.target)) {
            return;
          }

          setIsSettingsOpen(false);
        },
      },
    ]);
  }, [isTopBarExpanded, isSettingsOpen]);

  return (
    <>
      {isTopBarExpanded ? (
        <header className="flex h-12 flex-row items-center gap-3 border-b bg-sky-800 px-3 leading-4 text-white">
          {links.map((link) => (
            <Link
              href={link.href}
              key={link.href}
              className={`rounded p-2 font-bold hover:bg-sky-700 active:bg-sky-600 ${pathname === link.href ? 'bg-blue-900' : ''}`}
            >
              {link.title}
            </Link>
          ))}
        </header>
      ) : null}
      <div className="fixed right-2 top-0 isolate z-[1] flex h-12 flex-row items-center justify-center">
        {settings.isFPSPanelEnabled.value ? (
          <div className="pr-1">
            <FPSPanel />
          </div>
        ) : null}
        <button
          type="button"
          className="rounded p-2 text-white hover:bg-sky-700 active:bg-sky-600"
          onClick={() => setIsTopBarExpanded((current) => !current)}
          aria-label="toggle top bar visibility"
        >
          {isTopBarExpanded ? <PanelTopClose size={16} /> : <PanelTopOpen size={16} />}
        </button>
        <button
          type="button"
          ref={settingsTriggerRef}
          className="rounded p-2 text-white hover:bg-sky-700 active:bg-sky-600"
          onClick={() => setIsSettingsOpen((current) => !current)}
          aria-label="toggle top bar visibility"
        >
          <Settings size={16} />
        </button>
        {isSettingsOpen ? (
          <div
            className="absolute right-0 top-11 flex w-80 select-none flex-col gap-2 rounded bg-slate-100 p-2"
            ref={settingsDialogRef}
          >
            {Object.entries(settings).map(([key, field]) => {
              if (field.type === 'boolean') {
                return (
                  <BooleanField
                    field={field}
                    key={key}
                    fieldKey={key as keyof TSettings}
                    settings={settings}
                  />
                );
              }
              if (field.type === 'select') {
                return (
                  <SelectField
                    field={field}
                    key={key}
                    fieldKey={key as keyof TSettings}
                    settings={settings}
                  />
                );
              }
              return null;
            })}
          </div>
        ) : null}
      </div>
    </>
  );
}
