'use client';

import { useEffect } from 'react';
import { initializeFontTheme } from '@/lib/font-themes';
import { initializeFontSize } from '@/hooks/useFontSize';

/**
 * FontThemeInitializer Component
 * Initializes font theme and font size on app load
 * Must be placed in the root layout to work properly
 */
export function FontThemeInitializer() {
  useEffect(() => {
    // Initialize font theme when app loads
    initializeFontTheme();
    // Initialize font size when app loads
    initializeFontSize();
  }, []);

  return null;
}
