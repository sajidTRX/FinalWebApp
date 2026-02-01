"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import NovelSidebar from "@/components/novel-sidebar";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Save } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useFontTheme } from "@/hooks/useFontTheme";
import { useEditorSettings, getEditorTextStyleWithTheme } from "@/lib/editor-settings-context";
import { fontThemes } from "@/lib/font-themes";
import { EditorWrapper } from "@/components/EditorWrapper";

export default function NovelPage() {
  const searchParams = useSearchParams();
  const { currentTheme } = useFontTheme();
  const { settings } = useEditorSettings();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(
    "Chapter 1: The Beginning"
  );
  const [autoSave, setAutoSave] = useState(false);
  const [lastSavedText, setLastSavedText] = useState("");

  // Check for chapter parameter from URL on mount
  useEffect(() => {
    const chapterFromUrl = searchParams.get("chapter");
    if (chapterFromUrl) {
      setCurrentChapter(chapterFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    loadChapter();
  }, [currentChapter]);

  useEffect(() => {
    if (!autoSave || text === lastSavedText) return;

    const saveTimeout = setTimeout(() => {
      save();
    }, 2000);

    return () => clearTimeout(saveTimeout);
  }, [text, autoSave]);

  const loadChapter = async () => {
    try {
      setLoading(true);
      const filename = currentChapter;
      console.log("Loading file:", filename);

      const res = await fetch(
        `http://localhost:8000/api/file/${encodeURIComponent(filename)}`
      ).catch(error => {
        console.error('Network error:', error);
        throw new Error('Failed to connect to server. Please check if the backend is running.');
      });

      if (!res.ok) {
        if (res.status === 404) {
          setText("");
          setLastSavedText("");
          toast({
            title: "Chapter Not Found",
            description: "This chapter doesn't exist yet. You can start writing it now.",
            variant: "default",
          });
          return;
        }
        const errorText = await res.text();
        throw new Error(`Failed to load chapter: ${errorText || res.statusText}`);
      }

      const data = await res.json();
      console.log("Loaded content length:", data.content?.length || 0);
      setText(data.content || "");
      setLastSavedText(data.content || "");
    } catch (error: unknown) {
      console.error("Load error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load chapter. Please try again.";
      toast({
        title: "Error Loading Chapter",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: `${currentChapter}.pdf`,
          content: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentChapter}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

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

  const save = async () => {
    if (!text.trim()) {
      toast({
        title: "Warning",
        description: "Cannot save empty chapter content.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const filename = currentChapter;
      console.log("Saving file:", filename);
      console.log("Content length:", text.length);

      const response = await fetch(
        `http://localhost:8000/api/file/${encodeURIComponent(filename)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: text }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      const result = await response.json();
      setLastSavedText(text);
      console.log("Save response:", result);

      toast({
        title: "Success",
        description: "Chapter saved successfully",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save chapter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectChapter = async (chapter: string) => {
    // Save current content before switching (if there's content to save)
    if (text && text !== lastSavedText && currentChapter) {
      try {
        await fetch(
          `http://localhost:8000/api/file/${encodeURIComponent(currentChapter)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: text }),
          }
        );
        setLastSavedText(text);
      } catch (error) {
        console.error("Auto-save before switch failed:", error);
      }
    }
    // Clear current text immediately to prevent content leakage
    setText("");
    setLastSavedText("");
    // Then switch chapter (which triggers loadChapter via useEffect)
    setCurrentChapter(chapter);
  };

  return (
    <div className="font-mono flex h-screen bg-gradient-to-b from-[#c9b896] via-[#d4c4a8] to-[#bfae94] overflow-hidden">
      {showSidebar && (
        <NovelSidebar
          onClose={() => setShowSidebar(false)}
          onSelectChapter={handleSelectChapter}
          currentChapter={currentChapter}
        />
      )}

      <div className="flex-1 overflow-hidden bg-[#f5f0e8]">
        <div className="flex h-full flex-col">
          {/* Top toolbar - fixed height header */}
          <div className="shrink-0 border-b border-[#a89880] bg-[#efe6d5] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
            <div className="flex items-center justify-between gap-1 sm:gap-2">
              {/* Left section - Back + Chapters */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <BackButton href="/home" className="h-6 sm:h-7 md:h-8 px-1.5 sm:px-2 text-[10px] sm:text-xs" />
                {!showSidebar && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSidebar(true)} 
                    className="border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0] h-6 sm:h-7 md:h-8 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                  >
                    Chapters
                  </Button>
                )}
              </div>
              
              {/* Center section - Title */}
              <div className="flex-1 min-w-0 text-center px-1 sm:px-2">
                <h1 className="font-mono text-[10px] sm:text-xs md:text-sm font-medium text-[#3d3225] truncate">
                  {currentChapter}
                </h1>
              </div>
              
              {/* Right section - Controls */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <Switch
                    id="autosave"
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                    className="scale-[0.6] sm:scale-75 md:scale-90"
                  />
                  <Label htmlFor="autosave" className="text-[#3d3225] text-[8px] sm:text-[10px] md:text-xs hidden sm:inline">Autosave</Label>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExport} 
                  className="border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0] h-6 sm:h-7 md:h-8 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                >
                  <Download className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden md:inline ml-1">Export</span>
                </Button>
                <Button 
                  size="sm"
                  onClick={save} 
                  disabled={saving} 
                  className="bg-[#4a3f32] hover:bg-[#3d3225] text-[#efe6d5] h-6 sm:h-7 md:h-8 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                >
                  {saving ? (
                    <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                  <span className="hidden md:inline ml-1">{saving ? "Saving..." : "Save"}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Editor content */}
          <div className="flex-1 overflow-hidden p-2 sm:p-3 md:p-4">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 animate-spin text-[#6b5d4d]" />
              </div>
            ) : (
              <EditorWrapper
                content={text || ""}
                onChange={setText}
                mode="novel"
                placeholder="Start writing your story..."
                conceptMapDocumentId={`novel:${currentChapter}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
