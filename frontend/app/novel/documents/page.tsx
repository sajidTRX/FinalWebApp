"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DocumentGrid } from "@/components/documents";
import { NovelDocument } from "@/lib/documents/types";
import {
  getAllNovelDocuments,
  getActiveNovelDocuments,
  getArchivedNovelDocuments,
  createNovelDocument,
  renameNovelDocument,
  duplicateNovelDocument,
  archiveNovelDocument,
  restoreNovelDocument,
  deleteNovelDocument,
} from "@/lib/documents/novel-service";
import { setLastUsedMode } from "@/lib/last-used-mode";

export default function NovelDocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<NovelDocument[]>([]);
  const [archivedDocuments, setArchivedDocuments] = useState<NovelDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Load documents on mount
  const loadDocuments = useCallback(() => {
    setLoading(true);
    try {
      setDocuments(getActiveNovelDocuments());
      setArchivedDocuments(getArchivedNovelDocuments());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLastUsedMode("novel");
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreateNew = () => {
    const newDoc = createNovelDocument();
    loadDocuments();
    // Navigate to the new document
    router.push(`/novel/documents/${newDoc.id}`);
  };

  const handleOpen = (id: string) => {
    router.push(`/novel/documents/${id}`);
  };

  const handleRename = (id: string, newTitle: string) => {
    renameNovelDocument(id, newTitle);
    loadDocuments();
  };

  const handleDuplicate = (id: string) => {
    duplicateNovelDocument(id);
    loadDocuments();
  };

  const handleArchive = (id: string) => {
    archiveNovelDocument(id);
    loadDocuments();
  };

  const handleRestore = (id: string) => {
    restoreNovelDocument(id);
    loadDocuments();
  };

  const handleDelete = (id: string) => {
    deleteNovelDocument(id);
    loadDocuments();
  };

  return (
    <DocumentGrid
      type="novel"
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
