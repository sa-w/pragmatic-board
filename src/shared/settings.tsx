'use client';

import { createContext, ReactElement, ReactNode, useMemo, useState } from 'react';

type TSelectField<T> = {
  type: 'select';
  options: T[];
  value: T;
};

type TBooleanField = {
  type: 'boolean';
  value: boolean;
};

type TSettings = {
  isGlobalEnabled: TBooleanField;
  isFPSPanelEnabled: TBooleanField;
  isCPUBurnEnabled: TBooleanField;
  isDistanceDampeningEnabled: TBooleanField;
  isTimeDampeningEnabled: TBooleanField;
  boardScrollSpeed: TSelectField<'fast' | 'standard'>;
  columnScrollSpeed: TSelectField<'fast' | 'standard'>;
};

const defaultSettings: TSettings = {
  isGlobalEnabled: { type: 'boolean', value: true },
  isFPSPanelEnabled: { type: 'boolean', value: false },
  isCPUBurnEnabled: { type: 'boolean', value: false },
  isDistanceDampeningEnabled: { type: 'boolean', value: true },
  isTimeDampeningEnabled: { type: 'boolean', value: true },
  boardScrollSpeed: { type: 'select', options: ['fast', 'standard'], value: 'fast' },
  columnScrollSpeed: { type: 'select', options: ['fast', 'standard'], value: 'standard' },
};

export type TSettingsContext = {
  settings: TSettings;
  update: (args: Partial<TSettings>) => void;
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
      update: (change: Partial<TSettings>) => {
        setSettings({ ...settings, ...change });
      },
    };
  }, [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
