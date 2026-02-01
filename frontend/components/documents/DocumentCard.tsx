"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  FileText,
  MoreVertical,
  FolderOpen,
  Pencil,
  Copy,
  Archive,
  ArchiveRestore,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NovelDocument, NoteDocument } from "@/lib/documents/types";

interface DocumentCardProps {
  document: NovelDocument | NoteDocument;
  type: "novel" | "note";
  onClick: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
  isArchived?: boolean;
}

export function DocumentCard({
  document,
  type,
  onClick,
  onRename,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
  isArchived = false,
}: DocumentCardProps) {
  const Icon = type === "novel" ? BookOpen : FileText;
  const chapterCount = type === "novel" ? (document as NovelDocument).chapters?.length || 0 : null;

  // Get relative time
  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  // Get preview text (first ~40 chars of content)
  const getPreview = () => {
    if (type === "novel") {
      const novelDoc = document as NovelDocument;
      const firstChapter = novelDoc.chapters?.[0];
      if (firstChapter?.content) {
        const plainText = firstChapter.content.replace(/<[^>]*>/g, "").trim();
        return plainText.slice(0, 60) + (plainText.length > 60 ? "..." : "");
      }
    } else {
      const noteDoc = document as NoteDocument;
      if (noteDoc.content) {
        const plainText = noteDoc.content.replace(/<[^>]*>/g, "").trim();
        return plainText.slice(0, 60) + (plainText.length > 60 ? "..." : "");
      }
    }
    return "No content yet";
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click if clicking on dropdown
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      return;
    }
    onClick();
  };

  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-lg bg-[#f5f0e8] border-[#a89880] hover:border-[#8b7d6b]"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="shrink-0 rounded-md bg-[#e8ddd0] p-2">
              <Icon className="h-5 w-5 text-[#4a3f32]" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-medium truncate text-[#3d3225]">
                {document.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-[#6b5d4d]">
                  Edited {getRelativeTime(document.updatedAt)}
                </span>
                {isArchived && (
                  <Badge variant="secondary" className="text-xs bg-[#d4c4a8] text-[#4a3f32]">
                    Archived
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#e8ddd0]"
                data-dropdown-trigger
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 text-[#4a3f32]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="bg-[#f5f0e8] border-[#a89880]">
              <DropdownMenuItem onClick={onClick} className="text-[#3d3225] focus:bg-[#e8ddd0]">
                <FolderOpen className="mr-2 h-4 w-4" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRename} className="text-[#3d3225] focus:bg-[#e8ddd0]">
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate} className="text-[#3d3225] focus:bg-[#e8ddd0]">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#a89880]" />
              {isArchived ? (
                <>
                  {onRestore && (
                    <DropdownMenuItem onClick={onRestore} className="text-[#3d3225] focus:bg-[#e8ddd0]">
                      <ArchiveRestore className="mr-2 h-4 w-4" />
                      Restore
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Permanently
                    </DropdownMenuItem>
                  )}
                </>
              ) : (
                onArchive && (
                  <DropdownMenuItem onClick={onArchive} className="text-[#3d3225] focus:bg-[#e8ddd0]">
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[#6b5d4d] line-clamp-2 mb-2">{getPreview()}</p>
        {chapterCount !== null && (
          <div className="flex items-center gap-1 text-xs text-[#8b7d6b]">
            <BookOpen className="h-3 w-3" />
            {chapterCount} {chapterCount === 1 ? "chapter" : "chapters"}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
