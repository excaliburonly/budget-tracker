'use client';

import React, { createContext, useContext, useState } from 'react';
import { Theme, getThemeClass } from '@/utils/theme';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  initialTheme 
}: { 
  children: React.ReactNode; 
  initialTheme: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    // Set cookie
    document.cookie = `theme=${newTheme}; path=/; max-age=31536000`; // 1 year
    
    // Update class on html tag
    const html = document.documentElement;
    // Remove all theme classes
    html.classList.forEach(cls => {
      if (cls.startsWith('theme-')) {
        html.classList.remove(cls);
      }
    });
    
    const themeClass = getThemeClass(newTheme);
    if (themeClass) {
      html.classList.add(themeClass);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
