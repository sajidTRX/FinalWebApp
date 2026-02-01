"use client";

import { TipTapEditor } from "./TipTapEditor";
import { ConceptMapProvider } from "@/lib/contexts/concept-map-context";

interface EditorWrapperProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  mode: "novel" | "notes" | "journal";
  className?: string;
  /**
   * Stable identifier for this document, used to scope
   * concept map data in localStorage (e.g. chapter name,
   * note filename, or journal entry path).
   */
  conceptMapDocumentId?: string;
}

/**
 * EditorWrapper component that provides a consistent editor interface
 * across Novel, Notes, and Journal modes
 */
export function EditorWrapper({
  content,
  onChange,
  placeholder,
  mode,
  className = "",
  conceptMapDocumentId,
}: EditorWrapperProps) {
  const defaultPlaceholders = {
    novel: "Start writing your story...",
    notes: "Start taking notes...",
    journal: "Write your journal entry here...",
  };

  // Always use a storage key - fallback to mode-based key if no document ID provided
  const storageKey =
    typeof window !== "undefined"
      ? conceptMapDocumentId
        ? `tagore-concept-map:${conceptMapDocumentId}`
        : `tagore-concept-map:${mode}-default`
      : `tagore-concept-map:${mode}-ssr`;

  return (
    <div className={`flex-1 overflow-hidden ${className}`}>
      <ConceptMapProvider storageKey={storageKey}>
        <TipTapEditor
          content={content}
          onChange={onChange}
          placeholder={placeholder || defaultPlaceholders[mode]}
          mode={mode}
        />
      </ConceptMapProvider>
    </div>
  );
}

