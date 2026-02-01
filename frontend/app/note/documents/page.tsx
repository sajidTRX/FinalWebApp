"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DocumentGrid } from "@/components/documents";
import { NoteDocument } from "@/lib/documents/types";
import {
  getActiveNoteDocuments,
  getArchivedNoteDocuments,
  createNoteDocument,
  renameNoteDocument,
  duplicateNoteDocument,
  archiveNoteDocument,
  restoreNoteDocument,
  deleteNoteDocument,
} from "@/lib/documents/note-service";
import { setLastUsedMode } from "@/lib/last-used-mode";

export default function NoteDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<NoteDocument[]>([]);
  const [archivedDocuments, setArchivedDocuments] = useState<NoteDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Load documents on mount
  const loadDocuments = useCallback(() => {
    setLoading(true);
    try {
      setDocuments(getActiveNoteDocuments());
      setArchivedDocuments(getArchivedNoteDocuments());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLastUsedMode("note");
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateNew = () => {
    const newDoc = createNoteDocument();
    loadDocuments();
    // Navigate to the new document
    router.push(`/note/documents/${newDoc.id}`);
  };

  const handleOpen = (id: string) => {
    router.push(`/note/documents/${id}`);
  };

  const handleRename = (id: string, newTitle: string) => {
    renameNoteDocument(id, newTitle);
    loadDocuments();
  };

  const handleDuplicate = (id: string) => {
    duplicateNoteDocument(id);
    loadDocuments();
  };

  const handleArchive = (id: string) => {
    archiveNoteDocument(id);
    loadDocuments();
  };

  const handleRestore = (id: string) => {
    restoreNoteDocument(id);
    loadDocuments();
  };

  const handleDelete = (id: string) => {
    deleteNoteDocument(id);
    loadDocuments();
  };

  return (
    <DocumentGrid
      type="note"
      documents={documents}
      archivedDocuments={archivedDocuments}
      loading={loading}
      onCreateNew={handleCreateNew}
      onOpen={handleOpen}
      onRename={handleRename}
      onDuplicate={handleDuplicate}
      onArchive={handleArchive}
      onRestore={handleRestore}
      onDelete={handleDelete}
      onRefresh={loadDocuments}
    />
  );
}
