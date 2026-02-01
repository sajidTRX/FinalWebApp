"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "@/lib/tiptap-extensions/font-size";
import { LineHeight } from "@/lib/tiptap-extensions/line-height";
import { ConceptHighlight } from "@/lib/tiptap-extensions/concept-highlight";
import { useEditorSettings } from "@/lib/editor-settings-context";
import { fontThemes } from "@/lib/font-themes";
import { useFontTheme } from "@/hooks/useFontTheme";
import { FormattingToolbar } from "./FormattingToolbar";
import { AISelectionBubble } from "./AISelectionBubble";
import { ConceptMapToggle } from "./concept-map/concept-map-toggle";
import { ConceptMapSelectionPopup } from "./concept-map/selection-popup";
import { ConceptMapModal } from "./concept-map/concept-map-modal";

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  mode?: "novel" | "notes" | "journal";
}

// Helper function to convert plain text to HTML paragraphs
// Only converts if content is plain text (no HTML tags)
function ensureHtmlContent(content: string): string {
  if (!content || content.trim() === '') return '';
  
  // If content already has HTML tags, return as-is (this is from editor output)
  if (content.includes('<p>') || content.includes('<h1>') || content.includes('<h2>') || 
      content.includes('<ul>') || content.includes('<ol>') || content.includes('<blockquote>') ||
      content.includes('<strong>') || content.includes('<em>') || content.includes('<br>')) {
    return content;
  }
  
  // Convert plain text with line breaks to HTML paragraphs (this is from backend/file)
  const paragraphs = content.split(/\n\n+/).map(para => {
    // Handle single line breaks within paragraphs as <br>
    const lines = para.split(/\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return '';
    if (lines.length === 1) return `<p>${lines[0]}</p>`;
    return `<p>${lines.join('<br>')}</p>`;
  }).filter(p => p !== '');
  
  return paragraphs.join('');
}

export function TipTapEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className = "",
  mode = "novel",
}: TipTapEditorProps) {
  const { settings } = useEditorSettings();
  const { currentTheme } = useFontTheme();

  // Track if the last change was from the editor itself
  const lastEditorHTML = React.useRef<string>('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Underline,
      TextStyle,
      FontSize,
      LineHeight,
      ConceptHighlight,
    ],
    content: ensureHtmlContent(content),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEditorHTML.current = html; // Track editor's own output
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${className}`,
        'data-placeholder': placeholder,
        style: `font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: ${settings.fontSize === "small" ? "14px" : settings.fontSize === "large" ? "20px" : "16px"}; line-height: ${
          settings.fontSize === "small" ? "1.5" : settings.fontSize === "large" ? "1.7" : "1.6"
        };`,
      },
    },
  });

  // Update editor content when prop changes from external source (not from typing)
  React.useEffect(() => {
    if (editor) {
      // Skip if content came from the editor's own onUpdate (user typing)
      if (content === lastEditorHTML.current) {
        return;
      }
      
      // Convert plain text to HTML if needed (for content loaded from backend)
      const htmlContent = ensureHtmlContent(content || '');
      const currentHTML = editor.getHTML();
      
      // Normalize empty states for comparison
      const normalizedNew = htmlContent === '' ? '' : htmlContent;
      const normalizedCurrent = currentHTML === '<p></p>' ? '' : currentHTML;
      
      // Only update if content is actually different (external change like switching files)
      if (normalizedNew !== normalizedCurrent) {
        editor.commands.setContent(htmlContent, { emitUpdate: false });
        lastEditorHTML.current = editor.getHTML(); // Sync ref after setting
      }
    }
  }, [content, editor]);

  // Update font family when theme changes
  React.useEffect(() => {
    if (editor) {
      const fontStack = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
      editor.view.dom.style.fontFamily = fontStack;
    }
  }, [editor, currentTheme, mode]);

  // Update font size when settings change
  React.useEffect(() => {
    if (editor) {
      const fontSize =
        settings.fontSize === "small" ? "14px" : settings.fontSize === "large" ? "20px" : "16px";
      const lineHeight =
        settings.fontSize === "small" ? "1.5" : settings.fontSize === "large" ? "1.7" : "1.6";
      editor.view.dom.style.fontSize = fontSize;
      editor.view.dom.style.lineHeight = lineHeight;
    }
  }, [editor, settings.fontSize]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">Loading editor...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full border border-gray-200 rounded-lg overflow-hidden bg-white relative">
        <div className="flex items-center justify-between gap-1">
          <div className="flex-1 min-w-0">
            <FormattingToolbar editor={editor} />
          </div>
          <div className="pr-2 pt-2 flex-shrink-0">
            <ConceptMapToggle editor={editor} />
          </div>
        </div>
        <EditorContent
          editor={editor}
          className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 focus-within:outline-none scrollbar-hide"
          style={{
            minHeight: "100px",
          }}
        />
      </div>
      <AISelectionBubble editor={editor} />
      <ConceptMapSelectionPopup editor={editor} />
      <ConceptMapModal editor={editor} />
    </>
  );
}

