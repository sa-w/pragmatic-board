'use client';

import { TFields, TSelectField, TSettings } from '@/shared/settings';
import { SettingsContext } from '@/shared/settings-context';
import { forwardRef, useContext } from 'react';

type TLink = { title: string; href: string };

const links: TLink[] = [
  { title: 'Board', href: '/board' },
  { title: 'One column', href: '/one-column' },
  { title: 'Two columns', href: '/two-columns' },
];

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
      className="absolute right-0 top-11 flex max-h-[60vh] w-80 select-none flex-col gap-2 overflow-y-auto rounded bg-slate-100 p-2"
      ref={ref}
    >
      <button
        type="button"
        className="rounded bg-orange-200 p-2 hover:bg-orange-300 active:bg-orange-100"
        onClick={reset}
      >
        Reset defaults
      </button>
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
    </div>
  );
});
