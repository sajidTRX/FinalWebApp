"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Loader2,
  FileUp,
  ArrowLeft,
  Save,
  ArchiveRestore,
} from "lucide-react";
import { useFontTheme } from "@/hooks/useFontTheme";
import { useEditorSettings } from "@/lib/editor-settings-context";
import { EditorWrapper } from "@/components/EditorWrapper";
import NoteExporter from "@/components/note-exporter";
import {
  getNoteDocument,
  updateNoteContent,
  renameNoteDocument,
  restoreNoteDocument,
} from "@/lib/documents/note-service";
import { NoteDocument } from "@/lib/documents/types";
import { setLastUsedMode } from "@/lib/last-used-mode";

export default function NoteEditorPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = params.id as string;

  const { currentTheme } = useFontTheme();
  const { settings } = useEditorSettings();

  const [noteDocument, setNoteDocument] = useState<NoteDocument | null>(null);
  const [text, setText] = useState("");
  const [lastSavedText, setLastSavedText] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [showExporter, setShowExporter] = useState(false);

  // Load document
  const loadDocument = useCallback(() => {
    setLoading(true);
    try {
      const doc = getNoteDocument(documentId);
      if (!doc) {
        toast({
          title: "Note Not Found",
          description: "The requested note does not exist.",
          variant: "destructive",
        });
        router.push("/note/documents");
        return;
      }
      setNoteDocument(doc);
      setTitle(doc.title);
      setText(doc.content || "");
      setLastSavedText(doc.content || "");
    } finally {
      setLoading(false);
    }
  }, [documentId, router]);

  useEffect(() => {
    setLastUsedMode("note");
  }, []);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !noteDocument || text === lastSavedText) return;

    const saveTimeout = setTimeout(() => {
      saveNote();
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [text, autoSave, noteDocument, lastSavedText]);

  const hasUnsavedChanges = text !== lastSavedText;

  // Save note
  const saveNote = useCallback(async () => {
    if (!noteDocument) return;

    setSaving(true);
    try {
      const updated = updateNoteContent(noteDocument.id, text);
      if (updated) {
        setLastSavedText(text);
        setNoteDocument(updated);
      }
    } finally {
      setSaving(false);
    }
  }, [noteDocument, text]);

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  // Handle title blur (save on blur)
  const handleTitleBlur = () => {
    if (!noteDocument || title === noteDocument.title) return;
    
    const updated = renameNoteDocument(noteDocument.id, title);
    if (updated) {
      setNoteDocument(updated);
      toast({
        title: "Title Updated",
        description: "Note title has been updated",
      });
    }
  };

  // Handle restore from archive
  const handleRestore = () => {
    if (!noteDocument) return;
    restoreNoteDocument(noteDocument.id);
    const refreshedDoc = getNoteDocument(documentId);
    if (refreshedDoc) {
      setNoteDocument(refreshedDoc);
    }
    toast({
      title: "Restored",
      description: "Note has been restored from archive",
    });
  };

  // Handle manual save
  const handleSave = async () => {
    await saveNote();
    toast({
      title: "Saved",
      description: "Note saved successfully",
    });
  };

  // Keyboard shortcuts for Note Editor
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
        router.push("/note/documents");
        return;
      }

      // Export: Ctrl+E
      if (isCtrl && e.key === "e" && !target.isContentEditable) {
        e.preventDefault();
        setShowExporter(true);
        return;
      }
    };

    globalThis.document.addEventListener("keydown", handleKeyDown);
    return () => globalThis.document.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, router]);

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
              onClick={() => router.push("/note/documents")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-200" />
            <Input
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              className="w-64 font-medium border-transparent hover:border-gray-200 focus:border-gray-300"
              placeholder="Untitled Note"
            />
            {noteDocument?.isArchived && (
              <Badge variant="secondary">Archived</Badge>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {noteDocument?.isArchived && (
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExporter(true)}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
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
              mode="notes"
              placeholder="Start taking notes..."
              conceptMapDocumentId={`note-doc:${documentId}`}
            />
          )}
        </div>
      </div>

      {/* Exporter Modal */}
      {showExporter && noteDocument && (
        <NoteExporter
          title={title}
          notebook=""
          tags={[]}
          content={text}
          onClose={() => setShowExporter(false)}
        />
      )}
    </div>
  );
}
