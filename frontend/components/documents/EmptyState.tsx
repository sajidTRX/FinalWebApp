"use client";

import * as React from "react";
import { FileText, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  type: "novel" | "note";
  isArchive?: boolean;
  onCreateNew?: () => void;
}

export function EmptyState({ type, isArchive = false, onCreateNew }: EmptyStateProps) {
  const Icon = type === "novel" ? BookOpen : FileText;
  
  if (isArchive) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-[#e8ddd0] p-4 mb-4">
          <Icon className="h-12 w-12 text-[#8b7d6b]" />
        </div>
        <h3 className="text-lg font-medium text-[#3d3225] mb-2">
          No archived {type === "novel" ? "novels" : "notes"}
        </h3>
        <p className="text-sm text-[#6b5d4d] max-w-sm">
          When you archive {type === "novel" ? "a novel" : "a note"}, it will appear here.
          You can restore or permanently delete archived items.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-[#e8ddd0] p-4 mb-4">
        <Icon className="h-12 w-12 text-[#8b7d6b]" />
      </div>
      <h3 className="text-lg font-medium text-[#3d3225] mb-2">
        No {type === "novel" ? "novels" : "notes"} yet
      </h3>
      <p className="text-sm text-[#6b5d4d] max-w-sm mb-6">
        {type === "novel" 
          ? "Start your writing journey by creating your first novel. Each novel can contain multiple chapters."
          : "Create your first note to start capturing ideas and information."
        }
      </p>
      {onCreateNew && (
        <Button onClick={onCreateNew} className="bg-[#4a3f32] hover:bg-[#3d3225] text-[#efe6d5]">
          <Plus className="h-4 w-4 mr-2" />
          Create {type === "novel" ? "Novel" : "Note"}
        </Button>
      )}
    </div>
  );
}
