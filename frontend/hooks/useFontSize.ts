'use client';

import { useState, useEffect, useCallback } from 'react';

export type FontSize = 'small' | 'medium' | 'large' | 'x-large';

export interface FontSizeConfig {
  name: string;
  baseSize: number;
  lineHeight: number;
  scale: number;
}

export const fontSizes: Record<FontSize, FontSizeConfig> = {
  small: {
    name: 'Small',
    baseSize: 12,
    lineHeight: 1.5,
    scale: 0.85,
  },
  medium: {
    name: 'Medium',
    baseSize: 16,
    lineHeight: 1.6,
    scale: 1,
  },
  large: {
    name: 'Large',
    baseSize: 20,
    lineHeight: 1.7,
    scale: 1.25,
  },
  'x-large': {
    name: 'Extra Large',
    baseSize: 24,
    lineHeight: 1.8,
    scale: 1.5,
  },
};

/**
 * Get the current font size from localStorage or default
 */
export function getCurrentFontSize(): FontSize {
  if (typeof window === 'undefined') return 'medium';
  const stored = localStorage.getItem('fontSize');
  return (stored as FontSize) || 'medium';
}

/**
 * Set font size and apply to document
 */
export function setFontSize(size: FontSize): void {
  if (typeof window === 'undefined') return;

  // Store preference
  localStorage.setItem('fontSize', size);

  // Apply to document
  const config = fontSizes[size];
  document.documentElement.style.setProperty('--base-font-size', `${config.baseSize}px`);
  document.documentElement.style.setProperty('--line-height', `${config.lineHeight}`);
  document.documentElement.style.setProperty('--font-scale', `${config.scale}`);
  document.documentElement.setAttribute('data-font-size', size);

  // Dispatch custom event for components to listen to
  window.dispatchEvent(
    new CustomEvent('fontSizeChange', {
      detail: { size, config },
    })
  );
}

/**
 * Initialize font size on app load
 */
export function initializeFontSize(): void {
  if (typeof window === 'undefined') return;
  const size = getCurrentFontSize();
  setFontSize(size);
}

/**
 * Hook to manage font size state and updates
 * Provides real-time font size switching without page reload
 */
export function useFontSize() {
  const [currentSize, setCurrentSize] = useState<FontSize>('medium');
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize font size on mount
  useEffect(() => {
    const size = getCurrentFontSize();
    setCurrentSize(size);
    setIsLoaded(true);

    // Listen for font size changes from other tabs/windows
    const handleFontSizeChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ size: FontSize }>;
      setCurrentSize(customEvent.detail.size);
    };

    window.addEventListener('fontSizeChange', handleFontSizeChange);
    return () => {
      window.removeEventListener('fontSizeChange', handleFontSizeChange);
    };
  }, []);

  // Change font size handler
  const changeFontSize = useCallback((size: FontSize) => {
    setFontSize(size);
    setCurrentSize(size);
  }, []);

  return {
    currentSize,
    changeFontSize,
    isLoaded,
    sizeConfig: fontSizes[currentSize],
    allSizes: fontSizes,
  };
}
