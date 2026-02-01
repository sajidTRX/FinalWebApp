"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ArrowUpDown,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { DocumentCard } from "./DocumentCard";
import { EmptyState } from "./EmptyState";
import { ConfirmDialog } from "./ConfirmDialog";
import { NovelDocument, NoteDocument, SortOption } from "@/lib/documents/types";

interface DocumentGridProps {
  type: "novel" | "note";
  documents: (NovelDocument | NoteDocument)[];
  archivedDocuments: (NovelDocument | NoteDocument)[];
  loading?: boolean;
  onCreateNew: () => void;
  onOpen: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onRefresh?: () => void;
}

export function DocumentGrid({
  type,
  documents,
  archivedDocuments,
  loading = false,
  onCreateNew,
  onOpen,
  onRename,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}: DocumentGridProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updatedAt");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Get the current documents based on active tab
  const currentDocuments = activeTab === "active" ? documents : archivedDocuments;

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = currentDocuments.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "createdAt":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "updatedAt":
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return filtered;
  }, [currentDocuments, searchQuery, sortBy]);

  const handleRenameClick = (id: string, currentTitle: string) => {
    setRenameTarget({ id, title: currentTitle });
    setRenameDialogOpen(true);
  };

  const handleRenameConfirm = () => {
    if (renameTarget && renameTarget.title.trim()) {
      onRename(renameTarget.id, renameTarget.title.trim());
      toast({
        title: "Renamed",
        description: `${type === "novel" ? "Novel" : "Note"} renamed successfully`,
      });
    }
    setRenameDialogOpen(false);
    setRenameTarget(null);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      onDelete(deleteTargetId);
      toast({
        title: "Deleted",
        description: `${type === "novel" ? "Novel" : "Note"} permanently deleted`,
      });
    }
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleArchiveClick = (id: string) => {
    onArchive(id);
    toast({
      title: "Archived",
      description: `${type === "novel" ? "Novel" : "Note"} moved to archive`,
    });
  };

  const handleRestoreClick = (id: string) => {
    onRestore(id);
    toast({
      title: "Restored",
      description: `${type === "novel" ? "Novel" : "Note"} restored from archive`,
    });
  };

  const handleDuplicateClick = (id: string) => {
    onDuplicate(id);
    toast({
      title: "Duplicated",
      description: `${type === "novel" ? "Novel" : "Note"} duplicated successfully`,
    });
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "title":
        return "Title";
      case "createdAt":
        return "Created";
      case "updatedAt":
      default:
        return "Last edited";
    }
  };

  // Keyboard shortcuts for DocumentGrid
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && target !== searchInputRef.current) {
        return;
      }

      const isCtrl = e.ctrlKey || e.metaKey;

      // Create new document: Ctrl+N
      if (isCtrl && e.key === "n") {
        e.preventDefault();
        onCreateNew();
        return;
      }

      // Focus search: Ctrl+F or /
      if ((isCtrl && e.key === "f") || (!isCtrl && e.key === "/")) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // Navigate documents: Arrow keys (only when not in search input)
      if (target !== searchInputRef.current) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          return;
        }

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(filteredDocuments.length - 1, prev + 1));
          return;
        }

        // Open selected document: Enter
        if (e.key === "Enter" && filteredDocuments[selectedIndex]) {
          e.preventDefault();
          onOpen(filteredDocuments[selectedIndex].id);
          return;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filteredDocuments, selectedIndex, onCreateNew, onOpen]);

  // Reset selected index when documents change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredDocuments.length, activeTab]);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-[#c9b896] via-[#d4c4a8] to-[#bfae94]">
      {/* Header */}
      <div className="border-b border-[#a89880] bg-[#efe6d5] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/landing")}
              className="hover:bg-[#e8ddd0] text-[#3d3225]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold text-[#3d3225]">
              {type === "novel" ? "My Novels" : "My Notes"}
            </h1>
          </div>
          <Button onClick={onCreateNew} className="bg-[#4a3f32] hover:bg-[#3d3225] text-[#efe6d5]">
            <Plus className="h-4 w-4 mr-2" />
            New {type === "novel" ? "Novel" : "Note"}
          </Button>
        </div>

        {/* Tabs and Search */}
        <div className="flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "archive")}>
            <TabsList className="bg-[#d4c4a8]">
              <TabsTrigger value="active" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">
                Active ({documents.length})
              </TabsTrigger>
              <TabsTrigger value="archive" className="data-[state=active]:bg-[#efe6d5] data-[state=active]:text-[#3d3225]">
                Archive ({archivedDocuments.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b5d4d]" />
              <Input
                ref={searchInputRef}
                placeholder={`Search ${type === "novel" ? "novels" : "notes"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 bg-[#f5f0e8] border-[#a89880] text-[#3d3225] placeholder:text-[#8b7d6b]"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-[#a89880] bg-[#f5f0e8] text-[#3d3225] hover:bg-[#e8ddd0]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  {getSortLabel()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#f5f0e8] border-[#a89880]">
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <DropdownMenuRadioItem value="updatedAt" className="text-[#3d3225] focus:bg-[#e8ddd0]">
                    Last edited
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title" className="text-[#3d3225] focus:bg-[#e8ddd0]">
                    Title
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="createdAt" className="text-[#3d3225] focus:bg-[#e8ddd0]">
                    Created
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#6b5d4d]" />
          </div>
        ) : filteredDocuments.length === 0 ? (
          searchQuery ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="h-12 w-12 text-[#a89880] mb-4" />
              <h3 className="text-lg font-medium text-[#3d3225] mb-2">
                No results found
              </h3>
              <p className="text-sm text-[#6b5d4d]">
                No {type === "novel" ? "novels" : "notes"} match &quot;{searchQuery}&quot;
              </p>
            </div>
          ) : (
            <EmptyState
              type={type}
              isArchive={activeTab === "archive"}
              onCreateNew={activeTab === "active" ? onCreateNew : undefined}
            />
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map((doc, index) => (
              <div
                key={doc.id}
                className={index === selectedIndex ? "ring-2 ring-[#6b5d4d] ring-offset-2 rounded-lg" : ""}
              >
                <DocumentCard
                  document={doc}
                  type={type}
                  isArchived={activeTab === "archive"}
                  onClick={() => onOpen(doc.id)}
                onRename={() => handleRenameClick(doc.id, doc.title)}
                onDuplicate={() => handleDuplicateClick(doc.id)}
                onArchive={activeTab === "active" ? () => handleArchiveClick(doc.id) : undefined}
                onRestore={activeTab === "archive" ? () => handleRestoreClick(doc.id) : undefined}
                onDelete={activeTab === "archive" ? () => handleDeleteClick(doc.id) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="bg-[#f5f0e8] border-[#a89880]">
          <DialogHeader>
            <DialogTitle className="text-[#3d3225]">Rename {type === "novel" ? "Novel" : "Note"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rename-input" className="text-[#4a3f32]">Title</Label>
            <Input
              id="rename-input"
              value={renameTarget?.title || ""}
              onChange={(e) =>
                setRenameTarget((prev) =>
                  prev ? { ...prev, title: e.target.value } : null
                )
              }
              className="mt-2 bg-[#efe6d5] border-[#a89880] text-[#3d3225]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleRenameConfirm();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)} className="border-[#a89880] text-[#3d3225] hover:bg-[#e8ddd0]">
              Cancel
            </Button>
            <Button onClick={handleRenameConfirm} className="bg-[#4a3f32] hover:bg-[#3d3225] text-[#efe6d5]">Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Permanently?"
        description={`This ${type === "novel" ? "novel" : "note"} will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
