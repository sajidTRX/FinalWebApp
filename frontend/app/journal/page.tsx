"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Save,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useFontTheme } from "@/hooks/useFontTheme";
import { useEditorSettings, getEditorTextStyleWithTheme } from "@/lib/editor-settings-context";
import { fontThemes } from "@/lib/font-themes";
import { EditorWrapper } from "@/components/EditorWrapper";
import { setLastUsedMode } from "@/lib/last-used-mode";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
}

export default function Journal() {
  const router = useRouter();
  const { currentTheme } = useFontTheme();
  const { settings } = useEditorSettings();
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [entries, setEntries] = useState<{ [key: string]: JournalEntry[] }>({});
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // Generate days of the week
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    setLastUsedMode("journal");
  }, []);

  useEffect(() => {
    // Set today as the selected day by default
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    setSelectedDay(today);

    // Load entries for the selected day
    loadEntries(today);
  }, []);

  const loadEntries = async (day: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/journal/${day}`);
      const data = await response.json();
      setEntries((prev) => ({
        ...prev,
        [day]: data.entries || [],
      }));
      // Clear current entry when loading new day's entries
      setCurrentEntry(null);
    } catch (error) {
      console.error("Error loading entries:", error);
      setEntries((prev) => ({
        ...prev,
        [day]: [],
      }));
      setCurrentEntry(null);
    }
  };

  // Handle day selection with save
  const handleSelectDay = useCallback(async (day: string) => {
    if (day === selectedDay) return;
    
    // Save current entry if it exists and has content
    if (currentEntry && currentEntry.content) {
      try {
        await fetch("http://localhost:8000/api/journal/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: `${selectedDay.toLowerCase()}/${currentEntry.title}.txt`,
            content: currentEntry.content,
          }),
        });
      } catch (error) {
        console.error("Auto-save before day switch failed:", error);
      }
    }
    
    // Clear current entry immediately
    setCurrentEntry(null);
    
    // Switch day and load entries
    setSelectedDay(day);
    loadEntries(day);
  }, [currentEntry, selectedDay]);

  // Handle entry selection with save
  const handleSelectEntry = useCallback(async (entry: JournalEntry) => {
    if (currentEntry?.id === entry.id) return;
    
    // Save current entry if it exists and has content
    if (currentEntry && currentEntry.content) {
      try {
        await fetch("http://localhost:8000/api/journal/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            filename: `${selectedDay.toLowerCase()}/${currentEntry.title}.txt`,
            content: currentEntry.content,
          }),
        });
      } catch (error) {
        console.error("Auto-save before entry switch failed:", error);
      }
    }
    
    setCurrentEntry(entry);
  }, [currentEntry, selectedDay]);

  const createNewEntry = useCallback(() => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: `Entry ${entries[selectedDay]?.length + 1 || 1}`,
      content: "",
      date: new Date().toISOString(),
    };

    setEntries((prev) => ({
      ...prev,
      [selectedDay]: [...(prev[selectedDay] || []), newEntry],
    }));
    setCurrentEntry(newEntry);
  }, [selectedDay, entries]);

  const saveEntry = useCallback(async () => {
    if (!currentEntry) return;

    try {
      setSaving(true);
      await fetch("http://localhost:8000/api/journal/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: `${selectedDay.toLowerCase()}/${currentEntry.title}.txt`,
          content: currentEntry.content,
        }),
      });

      toast({
        title: "Success",
        description: "Journal entry saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [currentEntry, selectedDay]);

  const deleteEntry = useCallback(async (entry: JournalEntry) => {
    try {
      await fetch(`http://localhost:8000/api/journal/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: `${selectedDay.toLowerCase()}/${entry.title}.txt`,
        }),
      });

      setEntries((prev) => ({
        ...prev,
        [selectedDay]: prev[selectedDay].filter((e) => e.id !== entry.id),
      }));

      if (currentEntry?.id === entry.id) {
        setCurrentEntry(null);
      }

      toast({
        title: "Success",
        description: "Entry deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete entry. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedDay, currentEntry]);

  const startEditingTitle = useCallback(() => {
    if (currentEntry) {
      setNewTitle(currentEntry.title);
      setEditingTitle(true);
    }
  }, [currentEntry]);

  const saveNewTitle = async () => {
    if (!currentEntry || !newTitle.trim()) return;

    try {
      // Delete old file
      await fetch(`http://localhost:8000/api/journal/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: `${selectedDay.toLowerCase()}/${currentEntry.title}.txt`,
        }),
      });

      // Save with new title
      await fetch("http://localhost:8000/api/journal/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: `${selectedDay.toLowerCase()}/${newTitle}.txt`,
          content: currentEntry.content,
        }),
      });

      // Update local state
      const updatedEntry = { ...currentEntry, title: newTitle };
      setCurrentEntry(updatedEntry);
      setEntries((prev) => ({
        ...prev,
        [selectedDay]: prev[selectedDay].map((e) =>
          e.id === currentEntry.id ? updatedEntry : e
        ),
      }));

      toast({
        title: "Success",
        description: "Entry renamed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEditingTitle(false);
    }
  };

  const cancelEditingTitle = () => {
    setEditingTitle(false);
    setNewTitle("");
  };

  const suggestionPool = useMemo(
    () => [
      "Reflect on a moment that made you smile today.",
      "Describe a challenge you faced at work or school and what you learned.",
      "List three things you are grateful for right now.",
      "Write about someone who inspired you recently.",
      "Capture a sensory detail from your day (a smell, sound, or texture).",
      "Document a small victory you experienced today.",
      "What is one thing you would like to improve tomorrow?",
      "Recount a meaningful conversation you had today.",
      "How did you take care of yourself today?",
      "Describe the weather and how it influenced your mood.",
    ],
    []
  );

  const dailySuggestions = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const shuffled = [...suggestionPool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = (seed + i * 31) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 3);
  }, [suggestionPool]);

  // Keyboard shortcuts for Journal mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        // Allow Ctrl+S for save even in editor
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault();
          if (currentEntry) {
            saveEntry();
          }
        }
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      // Day navigation: 1-7 for Monday-Sunday
      if (!isCtrl && !e.shiftKey && e.key >= "1" && e.key <= "7") {
        const dayIndex = parseInt(e.key) - 1;
        if (dayIndex >= 0 && dayIndex < daysOfWeek.length) {
          e.preventDefault();
          handleSelectDay(daysOfWeek[dayIndex]);
        }
        return;
      }

      // Entry navigation: Arrow keys
      if (!isCtrl && e.key === "ArrowUp") {
        e.preventDefault();
        const currentEntries = entries[selectedDay] || [];
        if (currentEntry) {
          const currentIndex = currentEntries.findIndex((e) => e.id === currentEntry.id);
          if (currentIndex > 0) {
            handleSelectEntry(currentEntries[currentIndex - 1]);
          }
        } else if (currentEntries.length > 0) {
          handleSelectEntry(currentEntries[currentEntries.length - 1]);
        }
        return;
      }

      if (!isCtrl && e.key === "ArrowDown") {
        e.preventDefault();
        const currentEntries = entries[selectedDay] || [];
        if (currentEntry) {
          const currentIndex = currentEntries.findIndex((e) => e.id === currentEntry.id);
          if (currentIndex < currentEntries.length - 1) {
            handleSelectEntry(currentEntries[currentIndex + 1]);
          }
        } else if (currentEntries.length > 0) {
          handleSelectEntry(currentEntries[0]);
        }
        return;
      }

      // Create new entry: Ctrl+N or just N
      if ((isCtrl && e.key === "n") || (!isCtrl && e.key === "n")) {
        e.preventDefault();
        createNewEntry();
        return;
      }

      // Save: Ctrl+S
      if (isCtrl && e.key === "s") {
        e.preventDefault();
        if (currentEntry) {
          saveEntry();
        }
        return;
      }

      // Delete entry: Delete key
      if (e.key === "Delete" && currentEntry) {
        e.preventDefault();
        if (confirm("Are you sure you want to delete this entry?")) {
          deleteEntry(currentEntry);
        }
        return;
      }

      // Edit title: Ctrl+E
      if (isCtrl && e.key === "e" && currentEntry && !editingTitle) {
        e.preventDefault();
        startEditingTitle();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedDay, entries, currentEntry, editingTitle, daysOfWeek, handleSelectDay, handleSelectEntry, createNewEntry, saveEntry, deleteEntry, startEditingTitle]);

  return (
    <div className="flex h-screen bg-gradient-to-b from-[#c9b896] via-[#d4c4a8] to-[#bfae94]">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#a89880] bg-[#efe6d5] p-4">
        <div className="flex items-center justify-between mb-2">
          <BackButton href="/landing" className="shrink-0" />
          <button
            type="button"
            aria-label="Close and Go Home"
            onClick={() => router.push("/landing")}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-[#e8ddd0] text-[#3d3225] h-9 rounded-md px-3"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#3d3225]">Weekly Journal</h2>
          <Calendar className="h-5 w-5 text-[#6b5d4d]" />
        </div>

        <div className="h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden">
          {daysOfWeek.map((day) => (
            <div key={day} className="mb-4">
              <div
                className={`mb-2 cursor-pointer rounded-lg p-2 ${
                  selectedDay === day ? "bg-[#d4c4a8]" : "hover:bg-[#e8ddd0]"
                }`}
                onClick={() => handleSelectDay(day)}
              >
                <h3 className="font-medium text-[#3d3225]">{day}</h3>
              </div>

              {entries[day]?.map((entry) => (
                <div
                  key={entry.id}
                  className={`ml-4 cursor-pointer rounded-lg p-2 ${
                    currentEntry?.id === entry.id
                      ? "bg-[#d4c4a8]"
                      : "hover:bg-[#e8ddd0]"
                  }`}
                  onClick={() => handleSelectEntry(entry)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#3d3225]">{entry.title}</span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-[#c9b896]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentEntry(entry);
                          startEditingTitle();
                        }}
                      >
                        <Edit2 className="h-3 w-3 text-[#4a3f32]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-[#c9b896]"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-[#4a3f32]" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="mt-1 w-full justify-start pl-4 text-[#4a3f32] hover:bg-[#e8ddd0]"
                onClick={createNewEntry}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Entry
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-[#f5f0e8]">
        {currentEntry ? (
          <>
            <div className="border-b border-[#a89880] p-4 bg-[#efe6d5]">
              {editingTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="flex-1 text-xl font-semibold bg-[#f5f0e8] border border-[#a89880] rounded px-2 py-1 focus:outline-none focus:border-[#6b5d4d] text-[#3d3225]"
                    placeholder="Entry Title"
                    autoFocus
                  />
                  <Button size="sm" onClick={saveNewTitle} className="bg-[#4a3f32] hover:bg-[#3d3225] text-[#efe6d5]">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={cancelEditingTitle}
                    className="hover:bg-[#e8ddd0]"
                  >
                    <X className="h-4 w-4 text-[#4a3f32]" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={currentEntry.title}
                    onChange={(e) =>
                      setCurrentEntry({
                        ...currentEntry,
                        title: e.target.value,
                      })
                    }
                    className="w-full text-xl font-semibold bg-transparent border-none focus:outline-none text-[#3d3225]"
                    placeholder="Entry Title"
                  />
                  <Button variant="ghost" size="sm" onClick={startEditingTitle} className="hover:bg-[#e8ddd0]">
                    <Edit2 className="h-4 w-4 text-[#4a3f32]" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex-1 p-4">
              <EditorWrapper
                content={currentEntry.content || ""}
                onChange={(content) =>
                  setCurrentEntry({ ...currentEntry, content })
                }
                mode="journal"
                placeholder="Write your journal entry here..."
                conceptMapDocumentId={`journal:${selectedDay}:${currentEntry.id}`}
              />
            </div>
            <div className="border-t border-[#a89880] p-4 bg-[#efe6d5]">
              <Button onClick={saveEntry} disabled={saving} className="bg-[#4a3f32] hover:bg-[#3d3225] text-[#efe6d5]">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-[#6b5d4d]">
            Select or create a journal entry to begin writing
          </div>
        )}
      </div>
      <aside className="w-72 border-l border-[#a89880] bg-[#efe6d5] p-4 hidden lg:block">
        <h2 className="text-lg font-semibold mb-4 text-[#3d3225]">Today's Suggestions</h2>
        <div className="space-y-3">
          {dailySuggestions.map((suggestion) => (
            <div
              key={suggestion}
              className="rounded-lg border border-[#a89880] bg-[#f5f0e8] p-3 text-sm text-[#4a3f32]"
            >
              {suggestion}
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
