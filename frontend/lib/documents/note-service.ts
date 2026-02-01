// Note Documents Service - localStorage persistence with API-ready structure

import { NoteDocument } from './types';

const STORAGE_KEY = 'tagore_note_documents';

// Helper to generate unique IDs
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all note documents from localStorage
export const getAllNoteDocuments = (): NoteDocument[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Save all note documents to localStorage
const saveAllNoteDocuments = (documents: NoteDocument[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
};

// Get active (non-archived) note documents
export const getActiveNoteDocuments = (): NoteDocument[] => {
  return getAllNoteDocuments().filter(doc => !doc.isArchived);
};

// Get archived note documents
export const getArchivedNoteDocuments = (): NoteDocument[] => {
  return getAllNoteDocuments().filter(doc => doc.isArchived);
};

// Get a single note document by ID
export const getNoteDocument = (id: string): NoteDocument | null => {
  const documents = getAllNoteDocuments();
  return documents.find(doc => doc.id === id) || null;
};

// Create a new note document
export const createNoteDocument = (title?: string): NoteDocument => {
  const documents = getAllNoteDocuments();
  const now = new Date().toISOString();
  
  const newDocument: NoteDocument = {
    id: generateId(),
    title: title || `Untitled Note`,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
    content: '',
  };
  
  documents.push(newDocument);
  saveAllNoteDocuments(documents);
  return newDocument;
};

// Rename a note document
export const renameNoteDocument = (id: string, newTitle: string): NoteDocument | null => {
  const documents = getAllNoteDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) return null;
  
  documents[index].title = newTitle;
  documents[index].updatedAt = new Date().toISOString();
  saveAllNoteDocuments(documents);
  return documents[index];
};

// Duplicate a note document
export const duplicateNoteDocument = (id: string): NoteDocument | null => {
  const documents = getAllNoteDocuments();
  const original = documents.find(doc => doc.id === id);
  
  if (!original) return null;
  
  const now = new Date().toISOString();
  const duplicated: NoteDocument = {
    ...original,
    id: generateId(),
    title: `${original.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  };
  
  documents.push(duplicated);
  saveAllNoteDocuments(documents);
  return duplicated;
};

// Archive a note document
export const archiveNoteDocument = (id: string): NoteDocument | null => {
  const documents = getAllNoteDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) return null;
  
  documents[index].isArchived = true;
  documents[index].updatedAt = new Date().toISOString();
  saveAllNoteDocuments(documents);
  return documents[index];
};

// Restore (unarchive) a note document
export const restoreNoteDocument = (id: string): NoteDocument | null => {
  const documents = getAllNoteDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) return null;
  
  documents[index].isArchived = false;
  documents[index].updatedAt = new Date().toISOString();
  saveAllNoteDocuments(documents);
  return documents[index];
};

// Permanently delete a note document
export const deleteNoteDocument = (id: string): boolean => {
  const documents = getAllNoteDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) return false;
  
  documents.splice(index, 1);
  saveAllNoteDocuments(documents);
  return true;
};

// Update note content
export const updateNoteContent = (id: string, content: string): NoteDocument | null => {
  const documents = getAllNoteDocuments();
  const index = documents.findIndex(doc => doc.id === id);
  
  if (index === -1) return null;
  
  documents[index].content = content;
  documents[index].updatedAt = new Date().toISOString();
  saveAllNoteDocuments(documents);
  return documents[index];
};

// Update the entire note document
export const updateNoteDocument = (document: NoteDocument): NoteDocument | null => {
  const documents = getAllNoteDocuments();
  const index = documents.findIndex(doc => doc.id === document.id);
  
  if (index === -1) return null;
  
  documents[index] = {
    ...document,
    updatedAt: new Date().toISOString(),
  };
  saveAllNoteDocuments(documents);
  return documents[index];
};
