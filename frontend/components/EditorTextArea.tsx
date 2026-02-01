import React from 'react';
import { useEditorSettings, getEditorTextStyle } from '@/lib/editor-settings-context';

interface EditorTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

/**
 * EditorTextArea component that respects user's font size preferences
 * Only the text area changes size, NOT the entire UI
 */
export const EditorTextArea = React.forwardRef<
  HTMLTextAreaElement,
  EditorTextAreaProps
>(({ value, onChange, placeholder, className, readOnly }, ref) => {
  const { settings } = useEditorSettings();
  const textStyle = getEditorTextStyle(settings.fontSize, settings.fontFamily);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      style={textStyle}
      className={`
        w-full h-full p-6 bg-[#f5f0e8] 
        border-0 outline-none resize-none
        text-[#3d3225]
        placeholder-[#8b7d6b]
        focus:ring-0 focus:border-0
        ${className || ''}
      `}
    />
  );
});

EditorTextArea.displayName = 'EditorTextArea';
