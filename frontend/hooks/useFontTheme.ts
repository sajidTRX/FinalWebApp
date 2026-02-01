'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontTheme, setFontTheme, getCurrentFontTheme, fontThemes } from '@/lib/font-themes';

/**
 * Hook to manage font theme state and updates
 * Provides real-time font switching without page reload
 */
export function useFontTheme() {
  const [currentTheme, setCurrentTheme] = useState<FontTheme>('serif');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const theme = getCurrentFontTheme();
    setCurrentTheme(theme);
    setIsLoaded(true);

    // Listen for font theme changes from other tabs/windows
    const handleFontThemeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ theme: FontTheme }>;
      setCurrentTheme(customEvent.detail.theme);
    };

    window.addEventListener('fontThemeChange', handleFontThemeChange);
    return () => {
      window.removeEventListener('fontThemeChange', handleFontThemeChange);
    };
  }, []);

  // Change theme handler
  const changeTheme = useCallback((theme: FontTheme) => {
    setFontTheme(theme);
    setCurrentTheme(theme);
  }, []);

  // Toggle between themes
  const toggleTheme = useCallback(() => {
    const newTheme = currentTheme === 'serif' ? 'mono' : 'serif';
    changeTheme(newTheme);
  }, [currentTheme, changeTheme]);

  return {
    currentTheme,
    changeTheme,
    toggleTheme,
    isLoaded,
    themeConfig: fontThemes[currentTheme],
    allThemes: fontThemes,
  };
}
