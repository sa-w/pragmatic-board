'use client';

import { TFields, TSelectField, TSettings } from '@/shared/settings';
import { SettingsContext } from '@/shared/settings-context';
import { Gift } from 'lucide-react';
import Link from 'next/link';
import { forwardRef, useContext } from 'react';

type TBooleanFields = {
  [TKey in keyof TFields]: TFields[TKey]['type'] extends 'boolean' ? TFields[TKey] : never;
};

function BooleanField<TFieldKey extends keyof TBooleanFields>({
  fieldKey,
  fields,
  value,
}: {
  fields: TFields;
  fieldKey: TFieldKey;
  // TODO: better?
  value: boolean;
}) {
  const { update } = useContext(SettingsContext);
  const field = fields[fieldKey];
  return (
    <label className="flex flex-row gap-2 rounded border p-2">
      <div className="flex flex-grow flex-col">
        <span className="font-bold">{field.title}</span>
        <span className="text-balance text-sm">{field.description}</span>
      </div>
      <input type="checkbox" checked={value} onChange={() => update({ [fieldKey]: !value })} />
    </label>
  );
}

function SelectField({
  field,
  fieldKey,
  value,
}: {
  field: TSelectField<string>;
  fieldKey: keyof TSettings;
  value: string;
}) {
  const { update } = useContext(SettingsContext);
  return (
    <div className="flex flex-col gap-2 rounded border p-2">
      <span className="font-bold">{field.title}</span>
      <span className="text-balance text-sm">{field.description}</span>
      <select
        className="rounded p-2"
        value={value}
        onChange={(event) => update({ [fieldKey]: event.target.value as any })}
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

export const SettingsDialog = forwardRef<HTMLDivElement>(function SettingsDialog(props, ref) {
  const { settings, fields, reset } = useContext(SettingsContext);

  return (
    <div
      className="absolute right-0 top-11 flex max-h-[60vh] w-80 flex-col overflow-y-auto rounded bg-slate-100"
      ref={ref}
    >
      <div className="flex select-none flex-col gap-2 p-2">
        {/* Sorry TS :( */}
        {Object.entries(fields).map((value) => {
          const fieldKey = value[0] as keyof typeof fields;
          const field = value[1];
          if (field.type === 'boolean') {
            return (
              <BooleanField
                fields={fields}
                key={fieldKey}
                fieldKey={fieldKey}
                value={settings[fieldKey] as boolean}
              />
            );
          }
          if (field.type === 'select') {
            return (
              <SelectField
                field={field}
                key={fieldKey}
                fieldKey={fieldKey as keyof TSettings}
                value={settings[fieldKey] as string}
              />
            );
          }
          return null;
        })}
        <button
          type="button"
          className="rounded bg-orange-200 p-2 hover:bg-orange-300 active:bg-orange-100"
          onClick={reset}
        >
          Reset defaults
        </button>
      </div>
      <div className="sticky bottom-0 flex flex-row items-center gap-2 text-balance border-t bg-slate-200 p-2 text-sm">
        <Gift size={32} className="text-red-500" />
        <div>
          Made by{' '}
          <Link
            className="text-sky-800 hover:text-sky-700 active:text-sky-900"
            target="_blank"
            href="https://bsky.app/profile/alexreardon.bsky.social"
          >
            Alex Reardon
          </Link>{' '}
          with{' '}
          <Link
            className="text-sky-800 hover:text-sky-700 active:text-sky-900"
            target="_blank"
            href="https://github.com/atlassian/pragmatic-drag-and-drop"
          >
            Pragmatic drag and drop
          </Link>
          ,{' '}
          <Link
            className="text-sky-800 hover:text-sky-700 active:text-sky-900"
            target="_blank"
            href="https://react.dev/"
          >
            React
          </Link>
          , and{' '}
          <Link
            className="text-sky-800 hover:text-sky-700 active:text-sky-900"
            target="_blank"
            href="https://tailwindcss.com/"
          >
            TailwindCSS
          </Link>
          .
        </div>
      </div>
    </div>
  );
});
