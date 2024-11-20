'use client';

import { createContext, ReactNode, useMemo, useState } from 'react';
import { TFields, TSettings, fields } from './settings';

export type TSettingsContext = {
  fields: TFields;
  settings: TSettings;
  update: (args: Partial<TSettings>) => void;
};

const defaultSettings: TSettings = {
  isGlobalEnabled: true,
  isDistanceDampeningEnabled: true,
  isTimeDampeningEnabled: true,
  boardScrollSpeed: 'fast',
  columnScrollSpeed: 'standard',
  isFPSPanelEnabled: false,
  isCPUBurnEnabled: false,
};

export const SettingsContext = createContext<TSettingsContext>({
  fields,
  settings: defaultSettings,
  update: () => {},
});

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TSettings>(defaultSettings);

  const value = useMemo(() => {
    return {
      fields,
      settings,
      update: (partial: Partial<TSettings>) => {
        const updated = { ...settings, ...partial };
        setSettings(updated);
      },
    };
  }, [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
