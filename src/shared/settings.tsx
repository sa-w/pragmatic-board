'use client';

import { createContext, ReactElement, ReactNode, useMemo, useState } from 'react';

export type TSelectField<T> = {
  type: 'select';
  title: string;
  description: string;
  options: T[];
  value: T;
  // TODO: limit to boolean fields
  dependsOnBooleanField?: keyof TSettings;
};

export type TBooleanField = {
  type: 'boolean';
  title: string;
  description: string;
  value: boolean;
  // TODO: limit to boolean fields
  dependsOnBooleanField?: keyof TSettings;
};

export type TSettings = {
  isGlobalEnabled: TBooleanField;
  isFPSPanelEnabled: TBooleanField;
  isCPUBurnEnabled: TBooleanField;
  isDistanceDampeningEnabled: TBooleanField;
  isTimeDampeningEnabled: TBooleanField;
  boardScrollSpeed: TSelectField<'fast' | 'standard'>;
  columnScrollSpeed: TSelectField<'fast' | 'standard'>;
};

const defaultSettings: TSettings = {
  isGlobalEnabled: {
    type: 'boolean',
    title: 'Auto scrolling',
    description: 'Whether our custom auto scroller should be enabled',
    value: true,
  },
  isDistanceDampeningEnabled: {
    type: 'boolean',
    title: 'Distance dampening',
    description: 'Increase the max scroll speed as you get closer to an edge',
    value: true,
    dependsOnBooleanField: 'isGlobalEnabled',
  },
  isTimeDampeningEnabled: {
    type: 'boolean',
    title: 'Time dampening',
    description: 'Increase the max scroll speed the longer you are on an element',
    value: true,
    dependsOnBooleanField: 'isGlobalEnabled',
  },
  boardScrollSpeed: {
    type: 'select',
    title: 'Board auto scroll speed',
    description: 'What should the max horizontal scroll speed the board be?',
    options: ['fast', 'standard'],
    value: 'fast',
    dependsOnBooleanField: 'isGlobalEnabled',
  },
  columnScrollSpeed: {
    type: 'select',
    title: 'Column auto scroll speed',
    description: 'What should the max vertical scroll speed for columns be?',
    options: ['fast', 'standard'],
    value: 'standard',
    dependsOnBooleanField: 'isGlobalEnabled',
  },
  isFPSPanelEnabled: {
    type: 'boolean',
    title: 'FPS Panel',
    description: 'Display a panel with Frame Per Second (FPS) information',
    value: false,
  },
  isCPUBurnEnabled: {
    type: 'boolean',
    title: 'Drop FPS 🔥',
    description: 'Start heavy process that will cause the frame rate on the page to drop',
    value: false,
    dependsOnBooleanField: 'isFPSPanelEnabled',
  },
};

export type TSettingsContext = {
  settings: TSettings;
  update: <TKey extends keyof TSettings>(args: {
    key: TKey;
    value: TSettings[TKey]['value'];
  }) => void;
};

export const SettingsContext = createContext<TSettingsContext>({
  settings: defaultSettings,
  update: () => {},
});

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);

  const value: TSettingsContext = useMemo(() => {
    return {
      settings,
      update: <TKey extends keyof TSettings>({
        key,
        value,
      }: {
        key: TKey;
        value: TSettings[TKey]['value'];
      }) => {
        const clone = structuredClone(settings);
        clone[key].value = value;
        setSettings(clone);
      },
    };
  }, [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
