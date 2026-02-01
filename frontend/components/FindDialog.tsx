"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { Search, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FindDialogProps {
  editor: Editor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SearchMatch {
  from: number;
  to: number;
}

export function FindDialog({ editor, open, onOpenChange }: FindDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Escape special regex characters
  const escapeRegex = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  // Clear all highlights
  const clearHighlights = useCallback(() => {
    if (!editor) return;
    editor.commands.unsetHighlight();
    // Also remove bold from any matches
    const { from, to } = editor.state.selection;
    editor.commands.setTextSelection({ from, to });
  }, [editor]);

  // Scroll to a specific match
  const scrollToMatch = useCallback(
    (match: SearchMatch) => {
      if (!editor) return;

      editor
        .chain()
        .setTextSelection({ from: match.from, to: match.to })
        .scrollIntoView()
        .run();
    },
    [editor]
  );

  // Highlight matches using TipTap's highlight mark
  const highlightMatches = useCallback(
    (matchList: SearchMatch[], currentIdx: number) => {
      if (!editor) return;

      // Clear all existing highlights first
      editor.commands.unsetHighlight();

      // Apply highlights to all matches
      matchList.forEach((match, index) => {
        const isCurrent = index === currentIdx;
        
        editor
          .chain()
          .setTextSelection({ from: match.from, to: match.to })
          .setHighlight({ color: isCurrent ? "#fde047" : "#fef08a" })
          .run();

        // Make current match bold
        if (isCurrent) {
          editor
            .chain()
            .setTextSelection({ from: match.from, to: match.to })
            .toggleBold()
            .run();
        }
      });

      // Reset selection to current match
      if (matchList[currentIdx]) {
        editor
          .chain()
          .setTextSelection({ from: matchList[currentIdx].from, to: matchList[currentIdx].to })
          .run();
      }
    },
    [editor]
  );

  // Find all matches in the editor (supports multi-word phrases and line breaks)
  const findMatches = useCallback(
    (query: string) => {
      if (!editor || !query.trim()) {
        setMatches([]);
        setCurrentMatchIndex(-1);
        clearHighlights();
        return;
      }

      const newMatches: SearchMatch[] = [];
      const flags = caseSensitive ? "g" : "gi";
      
      // Escape regex special characters
      // Replace spaces/newlines with \s+ to match any whitespace (spaces, tabs, newlines)
      const normalizedQuery = query.trim();
      const escapedQuery = normalizedQuery
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\s+/g, "\\s+"); // Match any whitespace sequence

      // Build a map of text positions to document positions
      const textToDocMap: Array<{ textPos: number; docPos: number; nodeLength: number }> = [];
      let textOffset = 0;

      editor.state.doc.descendants((node, pos) => {
        if (node.isText) {
          const nodeText = node.text || "";
          textToDocMap.push({
            textPos: textOffset,
            docPos: pos,
            nodeLength: nodeText.length,
          });
          textOffset += nodeText.length;
        }
      });

      // Get the full text content
      const fullText = editor.state.doc.textContent;
      
      // Search in the full text
      const regex = new RegExp(escapedQuery, flags);
      let match: RegExpExecArray | null;
      let lastIndex = -1;

      while ((match = regex.exec(fullText)) !== null) {
        // Avoid infinite loops
        if (match.index === lastIndex) {
          break;
        }
        lastIndex = match.index;

        const matchStart = match.index;
        const matchEnd = match.index + match[0].length;

        // Find the document positions for this match
        let docFrom = -1;
        let docTo = -1;

        // Find the node containing the start of the match
        for (let i = 0; i < textToDocMap.length; i++) {
          const mapEntry = textToDocMap[i];
          const nodeEnd = mapEntry.textPos + mapEntry.nodeLength;

          if (matchStart >= mapEntry.textPos && matchStart < nodeEnd) {
            docFrom = mapEntry.docPos + (matchStart - mapEntry.textPos);
            break;
          }
        }

        // Find the node containing the end of the match
        for (let i = 0; i < textToDocMap.length; i++) {
          const mapEntry = textToDocMap[i];
          const nodeEnd = mapEntry.textPos + mapEntry.nodeLength;

          if (matchEnd > mapEntry.textPos && matchEnd <= nodeEnd) {
            docTo = mapEntry.docPos + (matchEnd - mapEntry.textPos);
            break;
          }
        }

        // If we found valid positions, add the match
        if (docFrom !== -1 && docTo !== -1 && docTo > docFrom) {
          newMatches.push({
            from: docFrom,
            to: docTo,
          });
        }
      }

      setMatches(newMatches);
      
      if (newMatches.length > 0) {
        const index = currentMatchIndex >= 0 && currentMatchIndex < newMatches.length 
          ? currentMatchIndex 
          : 0;
        setCurrentMatchIndex(index);
        highlightMatches(newMatches, index);
        scrollToMatch(newMatches[index]);
      } else {
        setCurrentMatchIndex(-1);
        clearHighlights();
      }
    },
    [editor, caseSensitive, currentMatchIndex, clearHighlights, highlightMatches, scrollToMatch]
  );

  // Navigate to next match
  const goToNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
    highlightMatches(matches, nextIndex);
    scrollToMatch(matches[nextIndex]);
  }, [matches, currentMatchIndex, highlightMatches, scrollToMatch]);

  // Navigate to previous match
  const goToPreviousMatch = useCallback(() => {
    if (matches.length === 0) return;
    const prevIndex =
      currentMatchIndex <= 0 ? matches.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    highlightMatches(matches, prevIndex);
    scrollToMatch(matches[prevIndex]);
  }, [matches, currentMatchIndex, highlightMatches, scrollToMatch]);

  // Handle search query change
  useEffect(() => {
    if (open && searchQuery) {
      findMatches(searchQuery);
    } else if (!searchQuery) {
      clearHighlights();
    }
  }, [searchQuery, open, findMatches, clearHighlights]);

  // Handle case sensitivity change
  useEffect(() => {
    if (open && searchQuery) {
      findMatches(searchQuery);
    }
  }, [caseSensitive, open, searchQuery, findMatches]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = target.tagName === "INPUT";

      // Escape to close
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }

      // Enter to find next (when input is focused)
      if (isInputFocused && e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        goToPreviousMatch();
        return;
      }

      if (isInputFocused && e.key === "Enter") {
        e.preventDefault();
        goToNextMatch();
        return;
      }

      // F3 or Ctrl+G for next match
      if (e.key === "F3" || ((e.ctrlKey || e.metaKey) && e.key === "g" && !e.shiftKey)) {
        e.preventDefault();
        goToNextMatch();
        return;
      }

      // Shift+F3 or Ctrl+Shift+G for previous match
      if (
        (e.shiftKey && e.key === "F3") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "G")
      ) {
        e.preventDefault();
        goToPreviousMatch();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    open,
    goToNextMatch,
    goToPreviousMatch,
    onOpenChange,
  ]);

  // Clear highlights when dialog closes
  useEffect(() => {
    if (!open) {
      clearHighlights();
      setSearchQuery("");
    }
  }, [open, clearHighlights]);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const input = document.querySelector(
          '[data-find-input]'
        ) as HTMLInputElement;
        if (input) {
          input.focus();
          input.select();
        }
      }, 100);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-[#f5f0e8]/95 backdrop-blur-sm border border-[#a89880]/50 rounded-lg shadow-lg p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b5d4d]" />
            <Input
              data-find-input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-20 bg-white/90 border-[#a89880] text-[#3d3225] placeholder:text-[#8b7d6b] focus:bg-white"
              autoFocus
            />
            {matches.length > 0 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6b5d4d] font-medium">
                {currentMatchIndex + 1} / {matches.length}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-[#4a3f32] hover:bg-[#e8ddd0]/50 shrink-0"
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {searchQuery && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousMatch}
                disabled={matches.length === 0}
                className="border-[#a89880] bg-white/80 text-[#3d3225] hover:bg-[#e8ddd0] hover:bg-white/90"
                title="Previous (Shift+Enter)"
              >
                <ChevronUp className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextMatch}
                disabled={matches.length === 0}
                className="border-[#a89880] bg-white/80 text-[#3d3225] hover:bg-[#e8ddd0] hover:bg-white/90"
                title="Next (Enter)"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Next
              </Button>
              <label className="flex items-center gap-2 text-sm text-[#4a3f32] ml-2">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="rounded border-[#a89880]"
                />
                Match case
              </label>
            </div>
            <div className="text-sm text-[#6b5d4d] font-medium">
              {matches.length === 0 && searchQuery
                ? "No matches found"
                : matches.length > 0
                ? `${matches.length} match${matches.length !== 1 ? "es" : ""}`
                : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
