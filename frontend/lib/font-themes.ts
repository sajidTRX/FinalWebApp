/**
 * Font Theme System
 * Defines Serif and Monospace font configurations
 */

export type FontTheme = 'serif' | 'mono';

export interface FontThemeConfig {
  name: string;
  cssVar: string;
  fontStack: string;
  description: string;
  weights: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export const fontThemes: Record<FontTheme, FontThemeConfig> = {
  serif: {
    name: 'Serif',
    cssVar: '--font-serif',
    fontStack: '"Georgia", "Garamond", "Times New Roman", serif',
    description: 'Classic serif font - elegant and traditional',
    weights: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  mono: {
    name: 'Monospace',
    cssVar: '--font-mono',
    fontStack: '"Courier New", "Monaco", "Consolas", monospace',
    description: 'Monospace font - modern and technical',
    weights: {
      thin: 100,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
};

/**
 * Get the current font theme from localStorage or default
 */
export function getCurrentFontTheme(): FontTheme {
  if (typeof window === 'undefined') return 'serif';
  const stored = localStorage.getItem('fontTheme');
  return (stored as FontTheme) || 'serif';
}

/**
 * Set font theme and apply to document
 */
export function setFontTheme(theme: FontTheme): void {
  if (typeof window === 'undefined') return;

  // Store preference
  localStorage.setItem('fontTheme', theme);

  // Apply to document
  const config = fontThemes[theme];
  document.documentElement.style.setProperty('--font-family', config.fontStack);
  document.documentElement.setAttribute('data-font-theme', theme);

  // Dispatch custom event for components to listen to
  window.dispatchEvent(
    new CustomEvent('fontThemeChange', {
      detail: { theme, config },
    })
  );
}

/**
 * Initialize font theme on app load
 */
export function initializeFontTheme(): void {
  if (typeof window === 'undefined') return;
  const theme = getCurrentFontTheme();
  setFontTheme(theme);
}
