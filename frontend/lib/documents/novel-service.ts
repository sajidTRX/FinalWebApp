// Novel Documents Service - localStorage persistence with API-ready structure

import { NovelDocument, Chapter } from './types';

const STORAGE_KEY = 'tagore_novel_documents';

// Helper to generate unique IDs
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all novel documents from localStorage
export const getAllNovelDocuments = (): NovelDocument[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save all novel documents to localStorage
const saveAllNovelDocuments = (documents: NovelDocument[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
};

// Get active (non-archived) novel documents
export const getActiveNovelDocuments = (): NovelDocument[] => {
  return getAllNovelDocuments().filter(doc => !doc.isArchived);
};

// Get archived novel documents
export const getArchivedNovelDocuments = (): NovelDocument[] => {
  return getAllNovelDocuments().filter(doc => doc.isArchived);
};

// Get a single novel document by ID
export const getNovelDocument = (id: string): NovelDocument | null => {
  const documents = getAllNovelDocuments();
  return documents.find(doc => doc.id === id) || null;
};

// Create a new novel document
export const createNovelDocument = (title?: string): NovelDocument => {
  const documents = getAllNovelDocuments();
  const now = new Date().toISOString();
  
  const newDocument: NovelDocument = {
    id: generateId(),
    title: title || `Untitled Novel`,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    chapters: [
      {
        id: generateId(),
        title: 'Chapter 1',
        order: 0,
        content: '',
        updatedAt: now,
      }
    ],
  };
  
  documents.push(newDocument);
  saveAllNovelDocuments(documents);
  return newDocument;
};

// Rename a novel document
export const renameNovelDocument = (id: string, newTitle: string): NovelDocument | null => {
  const documents = getAllNovelDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) return null;
  
  documents[index].title = newTitle;
  documents[index].updatedAt = new Date().toISOString();
  saveAllNovelDocuments(documents);
  return documents[index];
};

// Duplicate a novel document
export const duplicateNovelDocument = (id: string): NovelDocument | null => {
  const documents = getAllNovelDocuments();
  const original = documents.find(doc => doc.id === id);
  
  if (!original) return null;
  
  const now = new Date().toISOString();
  const duplicated: NovelDocument = {
    ...original,
    id: generateId(),
    title: `${original.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    chapters: original.chapters.map(chapter => ({
      ...chapter,
      id: generateId(),
      updatedAt: now,
    })),
  };
  
  documents.push(duplicated);
  saveAllNovelDocuments(documents);
  return duplicated;
};

// Archive a novel document
export const archiveNovelDocument = (id: string): NovelDocument | null => {
  const documents = getAllNovelDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) return null;
  
  documents[index].isArchived = true;
  documents[index].updatedAt = new Date().toISOString();
  saveAllNovelDocuments(documents);
  return documents[index];
};

// Restore (unarchive) a novel document
export const restoreNovelDocument = (id: string): NovelDocument | null => {
  const documents = getAllNovelDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) return null;
  
  documents[index].isArchived = false;
  documents[index].updatedAt = new Date().toISOString();
  saveAllNovelDocuments(documents);
  return documents[index];
};

// Permanently delete a novel document
export const deleteNovelDocument = (id: string): boolean => {
  const documents = getAllNovelDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) return false;
  
  documents.splice(index, 1);
  saveAllNovelDocuments(documents);
  return true;
};

// Update the entire novel document
export const updateNovelDocument = (document: NovelDocument): NovelDocument | null => {
  const documents = getAllNovelDocuments();
  const index = documents.findIndex(doc => doc.id === document.id);
  
  if (index === -1) return null;
  
  documents[index] = {
    ...document,
    updatedAt: new Date().toISOString(),
  };
  saveAllNovelDocuments(documents);
  return documents[index];
};

// Chapter operations

// Add a new chapter to a novel document
export const addChapter = (documentId: string, title?: string): Chapter | null => {
  const documents = getAllNovelDocuments();
  const index = documents.findIndex(doc => doc.id === documentId);
  
  if (index === -1) return null;
  
  const now = new Date().toISOString();
  const chapterNumber = documents[index].chapters.length + 1;
  
  const newChapter: Chapter = {
    id: generateId(),
    title: title || `Chapter ${chapterNumber}`,
    order: documents[index].chapters.length,
    content: '',
    updatedAt: now,
  };
  
  documents[index].chapters.push(newChapter);
  documents[index].updatedAt = now;
  saveAllNovelDocuments(documents);
  return newChapter;
};

// Rename a chapter
export const renameChapter = (documentId: string, chapterId: string, newTitle: string): Chapter | null => {
  const documents = getAllNovelDocuments();
  const docIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (docIndex === -1) return null;
  
  const chapterIndex = documents[docIndex].chapters.findIndex(ch => ch.id === chapterId);
  if (chapterIndex === -1) return null;
  
  const now = new Date().toISOString();
  documents[docIndex].chapters[chapterIndex].title = newTitle;
  documents[docIndex].chapters[chapterIndex].updatedAt = now;
  documents[docIndex].updatedAt = now;
  saveAllNovelDocuments(documents);
  return documents[docIndex].chapters[chapterIndex];
};

// Delete a chapter
export const deleteChapter = (documentId: string, chapterId: string): boolean => {
  const documents = getAllNovelDocuments();
  const docIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (docIndex === -1) return false;
  
  // Don't delete if it's the last chapter
  if (documents[docIndex].chapters.length <= 1) return false;
  
  const chapterIndex = documents[docIndex].chapters.findIndex(ch => ch.id === chapterId);
  if (chapterIndex === -1) return false;
  
  documents[docIndex].chapters.splice(chapterIndex, 1);
  
  // Reorder remaining chapters
  documents[docIndex].chapters.forEach((ch, idx) => {
    ch.order = idx;
  });
  
  documents[docIndex].updatedAt = new Date().toISOString();
  saveAllNovelDocuments(documents);
  return true;
};

// Reorder chapters
export const reorderChapters = (documentId: string, chapterIds: string[]): boolean => {
  const documents = getAllNovelDocuments();
  const docIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (docIndex === -1) return false;
  
  const reordered: Chapter[] = [];
  chapterIds.forEach((id, index) => {
    const chapter = documents[docIndex].chapters.find(ch => ch.id === id);
    if (chapter) {
      chapter.order = index;
      reordered.push(chapter);
    }
  });
  
  if (reordered.length !== documents[docIndex].chapters.length) return false;
  
  documents[docIndex].chapters = reordered;
  documents[docIndex].updatedAt = new Date().toISOString();
  saveAllNovelDocuments(documents);
  return true;
};

// Update chapter content
export const updateChapterContent = (documentId: string, chapterId: string, content: string): Chapter | null => {
  const documents = getAllNovelDocuments();
  const docIndex = documents.findIndex(doc => doc.id === documentId);
  
  if (docIndex === -1) return null;
  
  const chapterIndex = documents[docIndex].chapters.findIndex(ch => ch.id === chapterId);
  if (chapterIndex === -1) return null;
  
  const now = new Date().toISOString();
  documents[docIndex].chapters[chapterIndex].content = content;
  documents[docIndex].chapters[chapterIndex].updatedAt = now;
  documents[docIndex].updatedAt = now;
  saveAllNovelDocuments(documents);
  return documents[docIndex].chapters[chapterIndex];
};

// Get a specific chapter
export const getChapter = (documentId: string, chapterId: string): Chapter | null => {
  const document = getNovelDocument(documentId);
  if (!document) return null;
  return document.chapters.find(ch => ch.id === chapterId) || null;
};

// Get all chapters for a document (sorted by order)
export const getChapters = (documentId: string): Chapter[] => {
  const document = getNovelDocument(documentId);
  if (!document) return [];
  return [...document.chapters].sort((a, b) => a.order - b.order);
};
