'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type EditorFontSize = 'small' | 'medium' | 'large';

export interface EditorSettings {
  fontSize: EditorFontSize;
  fontFamily: 'serif' | 'mono';
}

interface EditorSettingsContextType {
  settings: EditorSettings;
  updateFontSize: (size: EditorFontSize) => void;
  updateFontFamily: (family: 'serif' | 'mono') => void;
  getFontSizePixels: (size: EditorFontSize) => number;
}

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 'medium',
  fontFamily: 'serif',
};

const EditorSettingsContext = createContext<EditorSettingsContextType | undefined>(undefined);

// Font size mapping to actual pixel values (ONLY for editor text, not UI)
export const EDITOR_FONT_SIZES: Record<EditorFontSize, number> = {
  small: 14,
  medium: 16,
  large: 20,
};

// Line height mapping for better readability
export const EDITOR_LINE_HEIGHTS: Record<EditorFontSize, number> = {
  small: 1.5,
  medium: 1.6,
  large: 1.7,
};

/**
 * Provider component that wraps the app
 * Manages editor font settings globally
 */
export function EditorSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('editorSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      }
    } catch (error) {
      console.error('Failed to load editor settings:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('editorSettings', JSON.stringify(settings));
      // Dispatch event for other components to listen
      window.dispatchEvent(new CustomEvent('editorSettingsChange', { detail: settings }));
    } catch (error) {
      console.error('Failed to save editor settings:', error);
    }
  }, [settings, isLoaded]);

  const updateFontSize = useCallback((fontSize: EditorFontSize) => {
    setSettings(prev => ({ ...prev, fontSize }));
  }, []);

  const updateFontFamily = useCallback((fontFamily: 'serif' | 'mono') => {
    setSettings(prev => ({ ...prev, fontFamily }));
  }, []);

  const getFontSizePixels = useCallback((size: EditorFontSize): number => {
    return EDITOR_FONT_SIZES[size];
  }, []);

  const value: EditorSettingsContextType = {
    settings,
    updateFontSize,
    updateFontFamily,
    getFontSizePixels,
  };

  return (
    <EditorSettingsContext.Provider value={value}>
      {children}
    </EditorSettingsContext.Provider>
  );
}

/**
 * Hook to use editor settings in components
 */
export function useEditorSettings(): EditorSettingsContextType {
  const context = useContext(EditorSettingsContext);
  if (!context) {
    throw new Error('useEditorSettings must be used within EditorSettingsProvider');
  }
  return context;
}

/**
 * Helper function to get inline style for editor text
 * Combines font size settings with font theme
 */
export function getEditorTextStyle(fontSize: EditorFontSize, fontFamily: 'serif' | 'mono' = 'serif') {
  // Font stack options
  const fontStacks = {
    serif: '"Georgia", "Garamond", "Times New Roman", serif',
    mono: '"Courier Prime", "Monaco", "Consolas", monospace',
  };

  return {
    fontSize: `${EDITOR_FONT_SIZES[fontSize]}px`,
    lineHeight: EDITOR_LINE_HEIGHTS[fontSize],
    fontFamily: fontStacks[fontFamily],
  };
}

/**
 * Alternative helper for getting style with custom font stack
 * Useful when you want to use the actual fontThemes config
 */
export function getEditorTextStyleWithTheme(
  fontSize: EditorFontSize,
  fontStack: string
) {
  return {
    fontSize: `${EDITOR_FONT_SIZES[fontSize]}px`,
    lineHeight: EDITOR_LINE_HEIGHTS[fontSize],
    fontFamily: fontStack,
  };
}
