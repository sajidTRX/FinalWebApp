"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  Download,
  ArrowLeft,
  BookOpen,
  ArchiveRestore,
} from "lucide-react";
import { useFontTheme } from "@/hooks/useFontTheme";
import { useEditorSettings } from "@/lib/editor-settings-context";
import { EditorWrapper } from "@/components/EditorWrapper";
import { ChapterQuickMenu, UnsavedChangesDialog } from "@/components/documents";
import {
  getNovelDocument,
  updateChapterContent,
  addChapter,
  renameChapter,
  deleteChapter,
  restoreNovelDocument,
} from "@/lib/documents/novel-service";
import { NovelDocument, Chapter } from "@/lib/documents/types";
import { setLastUsedMode } from "@/lib/last-used-mode";

export default function NovelEditorPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const { currentTheme } = useFontTheme();
  const { settings } = useEditorSettings();

  const [novelDocument, setNovelDocument] = useState<NovelDocument | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [text, setText] = useState("");
  const [lastSavedText, setLastSavedText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [chapterMenuOpen, setChapterMenuOpen] = useState(false);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [pendingChapterId, setPendingChapterId] = useState<string | null>(null);

  // Load document
  const loadDocument = useCallback(() => {
    setLoading(true);
    try {
      const doc = getNovelDocument(documentId);
      if (!doc) {
        toast({
          title: "Document Not Found",
          description: "The requested document does not exist.",
          variant: "destructive",
        });
        router.push("/novel/documents");
        return;
      }
      setNovelDocument(doc);
      
      // Set current chapter to first chapter if not set
      if (doc.chapters.length > 0) {
        const sortedChapters = [...doc.chapters].sort((a, b) => a.order - b.order);
        const firstChapter = sortedChapters[0];
        setCurrentChapter(firstChapter);
        setText(firstChapter.content || "");
        setLastSavedText(firstChapter.content || "");
      }
    } finally {
      setLoading(false);
    }
  }, [documentId, router]);

  useEffect(() => {
    setLastUsedMode("novel");
  }, []);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Keyboard shortcut for chapter menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K opens chapter menu
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setChapterMenuOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !currentChapter || text === lastSavedText) return;

    const saveTimeout = setTimeout(() => {
      saveCurrentChapter();
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [text, autoSave, currentChapter, lastSavedText]);

  const hasUnsavedChanges = text !== lastSavedText;

  // Save current chapter
  const saveCurrentChapter = useCallback(async () => {
    if (!novelDocument || !currentChapter) return;

    setSaving(true);
    try {
      const updated = updateChapterContent(novelDocument.id, currentChapter.id, text);
      if (updated) {
        setLastSavedText(text);
        // Refresh document to get updated data
        const refreshedDoc = getNovelDocument(documentId);
        if (refreshedDoc) {
          setNovelDocument(refreshedDoc);
        }
      }
    } finally {
      setSaving(false);
    }
  }, [novelDocument, currentChapter, text, documentId]);

  // Handle chapter selection
  const handleSelectChapter = (chapterId: string) => {
    if (currentChapter?.id === chapterId) return;

    if (hasUnsavedChanges && !autoSave) {
      setPendingChapterId(chapterId);
      setUnsavedDialogOpen(true);
      return;
    }

    // If autosave is on, save first
    if (autoSave && hasUnsavedChanges) {
      saveCurrentChapter().then(() => {
        switchToChapter(chapterId);
      });
    } else {
      switchToChapter(chapterId);
    }
  };

  const switchToChapter = (chapterId: string) => {
    if (!novelDocument) return;
    
    const chapter = novelDocument.chapters.find((c) => c.id === chapterId);
    if (chapter) {
      setCurrentChapter(chapter);
      setText(chapter.content || "");
      setLastSavedText(chapter.content || "");
    }
  };

  // Handle unsaved changes dialog actions
  const handleSaveAndSwitch = async () => {
    await saveCurrentChapter();
    if (pendingChapterId) {
      switchToChapter(pendingChapterId);
    }
    setUnsavedDialogOpen(false);
    setPendingChapterId(null);
  };

  const handleDiscardAndSwitch = () => {
    if (pendingChapterId) {
      switchToChapter(pendingChapterId);
    }
    setUnsavedDialogOpen(false);
    setPendingChapterId(null);
  };

  const handleCancelSwitch = () => {
    setUnsavedDialogOpen(false);
    setPendingChapterId(null);
  };

  // Create new chapter
  const handleCreateChapter = (title: string) => {
    if (!novelDocument) return;
    
    const newChapter = addChapter(novelDocument.id, title);
    if (newChapter) {
      // Refresh document
      const refreshedDoc = getNovelDocument(documentId);
      if (refreshedDoc) {
        setNovelDocument(refreshedDoc);
        // Switch to new chapter
        setCurrentChapter(newChapter);
        setText("");
        setLastSavedText("");
      }
    }
  };

  // Rename chapter
  const handleRenameChapter = (chapterId: string, newTitle: string) => {
    if (!novelDocument) return;
    
    renameChapter(novelDocument.id, chapterId, newTitle);
    // Refresh document
    const refreshedDoc = getNovelDocument(documentId);
    if (refreshedDoc) {
      setNovelDocument(refreshedDoc);
      // Update current chapter if it was renamed
      if (currentChapter?.id === chapterId) {
        const updatedChapter = refreshedDoc.chapters.find((c) => c.id === chapterId);
        if (updatedChapter) {
          setCurrentChapter(updatedChapter);
        }
      }
    }
  };

  // Delete chapter
  const handleDeleteChapter = (chapterId: string) => {
    if (!novelDocument) return;
    
    const success = deleteChapter(novelDocument.id, chapterId);
    if (success) {
      // Refresh document
      const refreshedDoc = getNovelDocument(documentId);
      if (refreshedDoc) {
        setNovelDocument(refreshedDoc);
        // If deleted chapter was current, switch to first chapter
        if (currentChapter?.id === chapterId) {
          const sortedChapters = [...refreshedDoc.chapters].sort((a, b) => a.order - b.order);
          if (sortedChapters.length > 0) {
            setCurrentChapter(sortedChapters[0]);
            setText(sortedChapters[0].content || "");
            setLastSavedText(sortedChapters[0].content || "");
          }
        }
      }
    }
  };

  // Handle restore from archive
  const handleRestore = () => {
    if (!novelDocument) return;
    restoreNovelDocument(novelDocument.id);
    const refreshedDoc = getNovelDocument(documentId);
    if (refreshedDoc) {
      setNovelDocument(refreshedDoc);
    }
    toast({
      title: "Restored",
      description: "Document has been restored from archive",
    });
  };

  // Handle manual save
  const handleSave = async () => {
    await saveCurrentChapter();
    toast({
      title: "Saved",
      description: "Chapter saved successfully",
    });
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: `${novelDocument?.title || "novel"}.pdf`,
          content: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = `${currentChapter?.title || "chapter"}.pdf`;
      window.document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(anchor);

      toast({
        title: "Success",
        description: "File exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export file. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Keyboard shortcuts for Novel Editor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isCtrl = e.ctrlKey || e.metaKey;

      // Save: Ctrl+S
      if (isCtrl && e.key === "s") {
        e.preventDefault();
        handleSave();
        return;
      }

      // Back: Ctrl+B (only when not in editor)
      if (isCtrl && e.key === "b" && !target.isContentEditable) {
        e.preventDefault();
        router.push("/novel/documents");
        return;
      }

      // Export: Ctrl+E
      if (isCtrl && e.key === "e" && !target.isContentEditable) {
        e.preventDefault();
        handleExport();
        return;
      }

      // Chapter menu: Ctrl+K (already exists, but ensure it works)
      if (isCtrl && e.key === "k") {
        e.preventDefault();
        setChapterMenuOpen(true);
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleExport, router]);

  // Sort chapters by order
  const sortedChapters = novelDocument?.chapters
    ? [...novelDocument.chapters].sort((a, b) => a.order - b.order)
    : [];

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/novel/documents")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChapterMenuOpen(true)}
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Chapters
              <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-gray-100 px-1.5 font-mono text-[10px] font-medium text-gray-600 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          </div>

          {/* Center - Document/Chapter Title */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{novelDocument?.title}</span>
            <span className="text-gray-300">/</span>
            <span className="font-medium">{currentChapter?.title}</span>
            {novelDocument?.isArchived && (
              <Badge variant="secondary" className="ml-2">
                Archived
              </Badge>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {novelDocument?.isArchived && (
              <Button variant="outline" size="sm" onClick={handleRestore}>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                Restore
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Switch
                id="autosave"
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
              <Label htmlFor="autosave" className="text-sm">
                Autosave
              </Label>
            </div>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full flex-col p-6">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <EditorWrapper
              content={text || ""}
              onChange={setText}
              mode="novel"
              placeholder="Start writing your story..."
              conceptMapDocumentId={`novel-doc:${params.id}`}
            />
          )}
        </div>
      </div>

      {/* Chapter Quick Menu */}
      <ChapterQuickMenu
        open={chapterMenuOpen}
        onOpenChange={setChapterMenuOpen}
        chapters={sortedChapters}
        currentChapterId={currentChapter?.id || null}
        onSelectChapter={handleSelectChapter}
        onCreateChapter={handleCreateChapter}
        onRenameChapter={handleRenameChapter}
        onDeleteChapter={handleDeleteChapter}
      />

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={unsavedDialogOpen}
        onOpenChange={setUnsavedDialogOpen}
        onSave={handleSaveAndSwitch}
        onDiscard={handleDiscardAndSwitch}
        onCancel={handleCancelSwitch}
      />
    </div>
  );
}
