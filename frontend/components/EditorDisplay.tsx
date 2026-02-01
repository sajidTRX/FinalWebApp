import React from 'react';
import { useEditorSettings, getEditorTextStyle } from '@/lib/editor-settings-context';

interface EditorDisplayProps {
  content: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * EditorDisplay component for displaying formatted editor content
 * Uses the same font size settings as the editor
 */
export const EditorDisplay = React.forwardRef<
  HTMLDivElement,
  EditorDisplayProps
>(({ content, className }, ref) => {
  const { settings } = useEditorSettings();
  const textStyle = getEditorTextStyle(settings.fontSize, settings.fontFamily);

  return (
    <div
      ref={ref}
      style={textStyle}
      className={`
        prose prose-sm
        max-w-none w-full
        text-[#3d3225]
        ${className || ''}
      `}
    >
      {content}
    </div>
  );
});

EditorDisplay.displayName = 'EditorDisplay';
