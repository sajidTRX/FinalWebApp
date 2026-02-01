// Document Types for Novel and Note modes

export interface Chapter {
  id: string;
  title: string;
  order: number;
  content: string;
  updatedAt: string;
}

export interface NovelDocument {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  chapters: Chapter[];
}

export interface NoteDocument {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  content: string;
}

export type DocumentType = 'novel' | 'note';

export type SortOption = 'updatedAt' | 'title' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export interface DocumentSortConfig {
  field: SortOption;
  direction: SortDirection;
}
