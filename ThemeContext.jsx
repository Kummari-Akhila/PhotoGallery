import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const DEFAULT_GALLERY_SETTINGS = {
  theme: 'dark', // Default to sleek photography darkroom look
  gridColumns: 3, // 1, 2, 3, 4
  sortBy: 'default', // 'default', 'most-liked', 'author-az', 'id'
  showDetailsOverlay: true,
  autoBackup: false,
  highResThumbnails: true
};

const SETTINGS_KEY = 'exactspace_gallery_settings_v2';

export function ThemeProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return { ...DEFAULT_GALLERY_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_GALLERY_SETTINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}

    // Apply data-theme to HTML root
    document.documentElement.setAttribute('data-theme', settings.theme);
    // Apply grid column variable
    document.documentElement.style.setProperty('--gallery-grid-cols', settings.gridColumns.toString());
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSetting, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
