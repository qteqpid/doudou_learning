import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Settings {
  studyTheme: 'light' | 'dark' | 'sepia' | 'rose' | 'ocean';
  tvBorder: 'classic' | 'wood' | 'modern' | 'neon';
  tvTriggerMethod: 'click' | 'calculator' | 'keyboard' | 'formula' | 'longpress' | 'selection' | 'header';
  tvTriggerCode: string;
  tvTriggerCount: number;
  tvTriggerText: string;
  fontSize: number;
  panicOnBlur: boolean;
  panicOnResize: boolean;
  rememberTvPosition: boolean;
  tvOpacity: number;
  tvIdleOpacity: number;
  tvX: number;
  tvY: number;
  showKnowledgePopups: boolean;
  knowledgeInterval: number;
  showOnlineCount: boolean;
  showStudyTimer: boolean;
  tvAnimationEnabled: boolean;
}

const defaultSettings: Settings = {
  studyTheme: 'light',
  tvBorder: 'classic',
  tvTriggerMethod: 'click',
  tvTriggerCode: '5201314',
  tvTriggerCount: 5,
  tvTriggerText: '微积分基本定理',
  fontSize: 100,
  panicOnBlur: true,
  panicOnResize: true,
  rememberTvPosition: true,
  tvOpacity: 1,
  tvIdleOpacity: 0.2,
  tvX: 100,
  tvY: 100,
  showKnowledgePopups: true,
  knowledgeInterval: 5,
  showOnlineCount: true,
  showStudyTimer: true,
  tvAnimationEnabled: true,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('edu-settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {}
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('edu-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
