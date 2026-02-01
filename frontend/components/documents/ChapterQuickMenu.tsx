"use client";

import * as React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/documents/ConfirmDialog";
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { Chapter } from "@/lib/documents/types";

interface ChapterQuickMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chapters: Chapter[];
  currentChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onCreateChapter: (title: string) => void;
  onRenameChapter: (chapterId: string, newTitle: string) => void;
  onDeleteChapter: (chapterId: string) => void;
}

export function ChapterQuickMenu({
  open,
  onOpenChange,
  chapters,
  currentChapterId,
  onSelectChapter,
  onCreateChapter,
  onRenameChapter,
  onDeleteChapter,
}: ChapterQuickMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"search" | "create" | "rename" | "delete">("search");
  const [editTarget, setEditTarget] = useState<Chapter | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setMode("search");
      setEditTarget(null);
      setNewTitle("");
    }
  }, [open]);

  // Focus input when mode changes
  useEffect(() => {
    if (mode === "create" || mode === "rename") {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [mode]);

  // Get preview snippet from chapter content
  const getChapterPreview = (content: string): string => {
    if (!content) return "Empty chapter";
    const plainText = content.replace(/<[^>]*>/g, "").trim();
    if (plainText.length === 0) return "Empty chapter";
    return plainText.slice(0, 40) + (plainText.length > 40 ? "..." : "");
  };

  // Filter chapters based on search
  const filteredChapters = chapters.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort chapters by order
  const sortedChapters = [...filteredChapters].sort((a, b) => a.order - b.order);

  const handleSelectChapter = (chapterId: string) => {
    onSelectChapter(chapterId);
    onOpenChange(false);
  };

  const handleCreateNew = () => {
    setNewTitle(`Chapter ${chapters.length + 1}`);
    setMode("create");
  };

  const handleConfirmCreate = () => {
    if (newTitle.trim()) {
      onCreateChapter(newTitle.trim());
      toast({
        title: "Chapter Created",
        description: `"${newTitle.trim()}" has been created`,
      });
      onOpenChange(false);
    }
  };

  const handleStartRename = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTarget(chapter);
    setNewTitle(chapter.title);
    setMode("rename");
  };

  const handleConfirmRename = () => {
    if (editTarget && newTitle.trim()) {
      onRenameChapter(editTarget.id, newTitle.trim());
      toast({
        title: "Chapter Renamed",
        description: `Chapter renamed to "${newTitle.trim()}"`,
      });
      setMode("search");
      setEditTarget(null);
    }
  };

  const handleStartDelete = (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chapters.length <= 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one chapter",
        variant: "destructive",
      });
      return;
    }
    setEditTarget(chapter);
    setMode("delete");
  };

  const handleConfirmDelete = () => {
    if (editTarget) {
      onDeleteChapter(editTarget.id);
      toast({
        title: "Chapter Deleted",
        description: `"${editTarget.title}" has been deleted`,
      });
      setMode("search");
      setEditTarget(null);
    }
  };

  const handleBack = () => {
    setMode("search");
    setEditTarget(null);
    setNewTitle("");
  };

  // Keyboard handler for the main dialog
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (mode !== "search") {
        e.preventDefault();
        handleBack();
      }
    }
  };

  // Search mode
  if (mode === "search") {
    return (
      <CommandDialog open={open} onOpenChange={onOpenChange}>
        <Command className="rounded-lg border shadow-md" onKeyDown={handleKeyDown}>
          <CommandInput
            placeholder="Search chapters..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No chapters found.</CommandEmpty>
            
            {/* New Chapter Action */}
            <CommandGroup heading="Actions">
              <CommandItem onSelect={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                <span>New Chapter</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator />

            {/* Chapter List */}
            <CommandGroup heading="Chapters">
              {sortedChapters.map((chapter) => (
                <CommandItem
                  key={chapter.id}
                  value={chapter.title}
                  onSelect={() => handleSelectChapter(chapter.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <FileText className="mr-2 h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{chapter.title}</span>
                        {chapter.id === currentChapterId && (
                          <Check className="h-3 w-3 text-green-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 truncate block">
                        {getChapterPreview(chapter.content)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => handleStartRename(chapter, e)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                      onClick={(e) => handleStartDelete(chapter, e)}
                      disabled={chapters.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    );
  }

  // Create mode
  if (mode === "create") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Chapter</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="new-chapter-title">Chapter Title</Label>
            <Input
              ref={inputRef}
              id="new-chapter-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-2"
              placeholder="Enter chapter title..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmCreate();
                } else if (e.key === "Escape") {
                  handleBack();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleConfirmCreate} disabled={!newTitle.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Rename mode
  if (mode === "rename" && editTarget) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Chapter</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-chapter-title">Chapter Title</Label>
            <Input
              ref={inputRef}
              id="rename-chapter-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-2"
              placeholder="Enter new title..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleConfirmRename();
                } else if (e.key === "Escape") {
                  handleBack();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleConfirmRename} disabled={!newTitle.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Delete mode
  if (mode === "delete" && editTarget) {
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            handleBack();
          }
          onOpenChange(isOpen);
        }}
        title="Delete Chapter?"
        description={`Are you sure you want to delete "${editTarget.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={handleBack}
      />
    );
  }

  return null;
}
