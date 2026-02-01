'use client';

import { useFontTheme } from '@/hooks/useFontTheme';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Type } from 'lucide-react';

/**
 * Font Theme Toggle Component
 * Allows users to switch between serif and monospace fonts
 * Can be placed in toolbar, settings, or anywhere accessible
 */
export function FontThemeToggle() {
  const { currentTheme, changeTheme, allThemes } = useFontTheme();

  if (!currentTheme) return null;

  return (
    <DropdownMenu>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        title="Change font theme"
      >
        <Type className="h-4 w-4" />
        <span className="hidden sm:inline text-sm font-medium">
          {allThemes[currentTheme].name}
        </span>
      </Button>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Font Style</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {Object.entries(allThemes).map(([themeKey, themeConfig]) => (
          <DropdownMenuCheckboxItem
            key={themeKey}
            checked={currentTheme === themeKey}
            onCheckedChange={() => changeTheme(themeKey as 'serif' | 'mono')}
            className="flex flex-col items-start"
          >
            <span className="font-medium">{themeConfig.name}</span>
            <span className="text-xs text-muted-foreground">
              {themeConfig.description}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
