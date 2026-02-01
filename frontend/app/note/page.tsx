"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import NotebookSelector from "@/components/notebook-selector";
import NoteExporter from "@/components/note-exporter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, FileUp, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { useFontTheme } from "@/hooks/useFontTheme";
import { useEditorSettings, getEditorTextStyleWithTheme } from "@/lib/editor-settings-context";
import { fontThemes } from "@/lib/font-themes";
import { EditorWrapper } from "@/components/EditorWrapper";

interface Note {
  filename: string;
  content: string;
  notebook: string;
  tags: string[];
}

export default function NotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentTheme } = useFontTheme();
  const { settings } = useEditorSettings();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentNotebook, setCurrentNotebook] = useState(
    () => searchParams.get("notebook") || "Physics"
  );
  const [showExporter, setShowExporter] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [originalFilename, setOriginalFilename] = useState<string | null>(null);
  const pendingOpenFileRef = useRef<string | null>(null);

  // Remember ?file from URL so we open it after notes load (e.g. from landing recent docs)
  useEffect(() => {
    const file = searchParams.get("file");
    if (file) pendingOpenFileRef.current = decodeURIComponent(file);
  }, [searchParams]);

  useEffect(() => {
    loadNotes();
  }, [currentNotebook]);

  useEffect(() => {
    if (!autoSave || !currentNote || currentNote.content === lastSavedContent)
      return;

    const saveTimeout = setTimeout(() => {
      saveNote();
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [currentNote?.content, autoSave]);

  // Save current note before switching notebooks
  const handleSelectNotebook = async (notebook: string) => {
    if (notebook === currentNotebook) return;
    
    // Save current note if it has unsaved changes
    if (currentNote && currentNote.content !== lastSavedContent) {
      try {
        await fetch(`http://localhost:8000/api/file/${currentNote.filename}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: currentNote.content }),
        });
      } catch (error) {
        console.error("Auto-save before notebook switch failed:", error);
      }
    }
    
    // Clear current note and notes list to prevent content leakage
    setCurrentNote(null);
    setNotes([]);
    setLastSavedContent("");
    
    // Switch notebook (triggers loadNotes via useEffect)
    setCurrentNotebook(notebook);
  };

  // Handle note selection with save
  const handleSelectNote = useCallback(async (note: Note) => {
    if (currentNote?.filename === note.filename) return;
    
    // Save current note if it has unsaved changes (including rename)
    if (currentNote) {
      await saveCurrentNote();
    }
    
    // Set the new note and track its original filename
    setCurrentNote(note);
    setOriginalFilename(note.filename);
    setLastSavedContent(note.content);
  }, [currentNote]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/files");
      const data = await res.json();

      // Filter notes by current notebook
      const notesData = await Promise.all(
        data.files
          .filter((f: string) => f.startsWith(currentNotebook))
          .map(async (filename: string) => {
            const noteRes = await fetch(
              `http://localhost:8000/api/file/${encodeURIComponent(filename)}`
            );
            const noteData = await noteRes.json();
            return {
              filename,
              content: noteData.content,
              notebook: currentNotebook,
              tags: ["math", "physics"], // TODO: Implement tags
            };
          })
      );

      setNotes(notesData);
      // Select the note from URL (landing recent doc) or first note of the notebook
      if (notesData.length > 0) {
        const fileToOpen = pendingOpenFileRef.current;
        const match = fileToOpen
          ? notesData.find(
              (n) =>
                n.filename === fileToOpen ||
                n.filename === fileToOpen.replace(/\.txt$/i, "") + ".txt"
            )
          : null;
        const noteToSelect = match || notesData[0];
        setCurrentNote(noteToSelect);
        setOriginalFilename(noteToSelect.filename);
        setLastSavedContent(noteToSelect.content);
        if (fileToOpen) pendingOpenFileRef.current = null;
      } else {
        setCurrentNote(null);
        setOriginalFilename(null);
        setLastSavedContent("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load notes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to save current note (used by both manual save and auto-save)
  const saveCurrentNote = useCallback(async () => {
    if (!currentNote) return;

    try {
      // Check if the filename has changed (rename)
      if (originalFilename && originalFilename !== currentNote.filename) {
        // Rename the file on the backend
        const renameRes = await fetch("http://localhost:8000/api/file/rename", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            oldName: originalFilename,
            newName: currentNote.filename,
          }),
        });

        if (renameRes.ok) {
          // Update the notes list with the new filename
          setNotes(prevNotes =>
            prevNotes.map(n =>
              n.filename === originalFilename
                ? { ...n, filename: currentNote.filename }
                : n
            )
          );
          setOriginalFilename(currentNote.filename);
        } else {
          console.error("Failed to rename file");
        }
      }

      // Save the content
      await fetch(`http://localhost:8000/api/file/${currentNote.filename}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: currentNote.content }),
      });

      setLastSavedContent(currentNote.content);
      return true;
    } catch (error) {
      console.error("Save error:", error);
      return false;
    }
  }, [currentNote, originalFilename, currentNotebook]);

  const saveNote = useCallback(async () => {
    if (!currentNote) return;

    try {
      setSaving(true);
      const success = await saveCurrentNote();
      
      if (success) {
        toast({
          title: "Success",
          description: "Note saved successfully",
        });
      } else {
        throw new Error("Save failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [currentNote, originalFilename, currentNotebook]);

  const createNewNote = useCallback(async () => {
    const newNote: Note = {
      filename: `${currentNotebook}/Untitled Note.txt`,
      content: "",
      notebook: currentNotebook,
      tags: [],
    };

    try {
      await fetch(`http://localhost:8000/api/file/${newNote.filename}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: "" }),
      });

      setNotes([...notes, newNote]);
      setCurrentNote(newNote);
      setOriginalFilename(newNote.filename);
      setLastSavedContent("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create new note. Please try again.",
        variant: "destructive",
      });
    }
  }, [currentNotebook, notes]);

  // Keyboard shortcuts for Note mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Allow Ctrl+S for save even in editor
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          if (currentNote) {
            saveNote();
          }
        }
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      // Create new note: Ctrl+N
      if (isCtrl && e.key === "n") {
        e.preventDefault();
        createNewNote();
        return;
      }

      // Save: Ctrl+S
      if (isCtrl && e.key === "s") {
        e.preventDefault();
        if (currentNote) {
          saveNote();
        }
        return;
      }

      // Toggle sidebar: Ctrl+B
      if (isCtrl && e.key === "b") {
        e.preventDefault();
        setSidebarOpen((prev) => !prev);
        return;
      }

      // Note navigation: Arrow keys
      if (!isCtrl && e.key === "ArrowUp") {
        e.preventDefault();
        const currentIndex = notes.findIndex((n) => n.filename === currentNote?.filename);
        if (currentIndex > 0) {
          handleSelectNote(notes[currentIndex - 1]);
        }
        return;
      }

      if (!isCtrl && e.key === "ArrowDown") {
        e.preventDefault();
        const currentIndex = notes.findIndex((n) => n.filename === currentNote?.filename);
        if (currentIndex < notes.length - 1) {
          handleSelectNote(notes[currentIndex + 1]);
        }
        return;
      }

      // Export: Ctrl+E
      if (isCtrl && e.key === "e") {
        e.preventDefault();
        if (currentNote) {
          setShowExporter(true);
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentNote, notes, sidebarOpen, createNewNote, saveNote, handleSelectNote, setShowExporter]);

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#c9b896] via-[#d4c4a8] to-[#bfae94]">
      {sidebarOpen && (
        <div className="w-64 border-r border-[#a89880] bg-[#efe6d5] p-4 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-2 shrink-0">
            <BackButton href="/landing" className="shrink-0" />
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-[#e8ddd0] text-[#3d3225] h-9 rounded-md px-3"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto fade-scroll pb-6 pr-1">
            <NotebookSelector
              currentNotebook={currentNotebook}
              onSelectNotebook={handleSelectNotebook}
            />
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium text-[#4a3f32]">Notes</h3>
              <div className="space-y-2">
                {notes.map((note) => (
                  <button
                    key={note.filename}
                    onClick={() => handleSelectNote(note)}
                    className={`w-full rounded-md p-2 text-left text-sm text-[#3d3225] ${
                      currentNote?.filename === note.filename
                        ? "bg-[#d4c4a8]"
                        : "hover:bg-[#e8ddd0]"
                    }`}
                  >
                    {note.filename.split("/").pop()?.replace(".txt", "")}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0]"
                onClick={createNewNote}
              >
                New Note
              </Button>
            </div>
          </div>
          {/* Bottom fade overlay */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#efe6d5] to-transparent" />
        </div>
      )}

      <div className="flex-1 overflow-hidden relative bg-[#f5f0e8]">
        <div className="flex h-full flex-col p-6">
          {loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#6b5d4d]" />
            </div>
          ) : currentNote ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <Input
                  value={
                    currentNote.filename
                      .split("/")
                      .pop()
                      ?.replace(".txt", "") || ""
                  }
                  onChange={(e) => {
                    if (currentNote) {
                      setCurrentNote({
                        ...currentNote,
                        filename: `${currentNotebook}/${e.target.value}.txt`,
                      });
                    }
                  }}
                  className="w-64 bg-[#efe6d5] border-[#a89880] text-[#3d3225]"
                />
                <div className="flex items-center space-x-4">
                  {!sidebarOpen && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSidebarOpen(true)}
                      className="text-sm border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0]"
                    >
                      Open Sidebar
                    </Button>
                  )}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autosave"
                      checked={autoSave}
                      onCheckedChange={setAutoSave}
                    />
                    <Label htmlFor="autosave" className="text-[#3d3225]">Autosave</Label>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowExporter(true)}
                    className="border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0]"
                  >
                    <FileUp className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button onClick={saveNote} disabled={saving} className="bg-[#4a3f32] hover:bg-[#3d3225] text-[#efe6d5]">
                    {saving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>

              <EditorWrapper
                content={currentNote.content || ""}
                onChange={(content) =>
                  setCurrentNote({ ...currentNote, content })
                }
                mode="notes"
                placeholder="Start taking notes..."
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-[#6b5d4d]">Select or create a note to begin</p>
            </div>
          )}
        </div>
      </div>
      {showExporter && currentNote && (
        <NoteExporter
          title={
            currentNote.filename.split("/").pop()?.replace(".txt", "") || ""
          }
          notebook={currentNote.notebook}
          tags={currentNote.tags}
          content={currentNote.content}
          onClose={() => setShowExporter(false)}
        />
      )}
    </div>
  );
}
