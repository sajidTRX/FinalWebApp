"use client";

import React, { createContext, useContext, useMemo } from "react";
import type {
  ConceptLink,
  ConceptMapState,
  ConceptNode,
  ConceptSelectionInfo,
  ConceptRelationshipType,
  ConceptNodeType,
} from "@/lib/types/concept-map";

export interface AIConceptMapNode {
  title: string;
  type: ConceptNodeType;
}

export interface AIConceptMapLink {
  sourceIndex: number;
  targetIndex: number;
  type: ConceptRelationshipType;
  label?: string;
}

export interface ConceptMapContextValue {
  state: ConceptMapState;
  addNodeFromSelection: (selection: ConceptSelectionInfo, nodeId?: string) => void;
  setConceptMapFromAI: (
    fullText: string,
    nodes: AIConceptMapNode[],
    links: AIConceptMapLink[]
  ) => void;
  deleteNode: (id: string) => void;
  renameNode: (id: string, title: string) => void;
  addLink: (
    sourceNodeId: string,
    targetNodeId: string,
    type: ConceptRelationshipType,
    label?: string
  ) => void;
  deleteLink: (id: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  setSelectedNode: (id: string | null) => void;
  setFocusedLink: (id: string | null) => void;
  setModalOpen: (open: boolean) => void;
  clearAll: () => void;
}

const ConceptMapContext = createContext<ConceptMapContextValue | undefined>(
  undefined
);

interface ProviderProps {
  storageKey: string;
  children: React.ReactNode;
}

function inferNodeType(text: string): ConceptNodeType {
  const trimmed = text.trim();
  if (!trimmed) return "default";
  if (trimmed.length <= 20 && /\s/.test(trimmed) === false) return "character";
  if (trimmed.length <= 30 && /\b(city|village|town|river|forest|street)\b/i.test(trimmed))
    return "place";
  if (trimmed.length > 60) return "idea";
  if (trimmed.length > 30) return "theme";
  return "default";
}

function loadState(storageKey: string): ConceptMapState {
  if (typeof window === "undefined") {
    return {
      nodes: [],
      links: [],
      selectedNodeId: null,
      focusedLinkId: null,
      isModalOpen: false,
    };
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return {
        nodes: [],
        links: [],
        selectedNodeId: null,
        focusedLinkId: null,
        isModalOpen: false,
      };
    }
    const parsed = JSON.parse(raw) as ConceptMapState;
    if (!parsed.nodes || !parsed.links) {
      return {
        nodes: [],
        links: [],
        selectedNodeId: null,
        focusedLinkId: null,
        isModalOpen: false,
      };
    }
    return {
      nodes: parsed.nodes,
      links: parsed.links,
      selectedNodeId: parsed.selectedNodeId ?? null,
      focusedLinkId: parsed.focusedLinkId ?? null,
      isModalOpen: parsed.isModalOpen ?? false,
    };
  } catch {
    return {
      nodes: [],
      links: [],
      selectedNodeId: null,
      focusedLinkId: null,
      isModalOpen: false,
    };
  }
}

function saveState(storageKey: string, state: ConceptMapState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function ConceptMapProvider({ storageKey, children }: ProviderProps) {
  const [state, setState] = React.useState<ConceptMapState>(() =>
    loadState(storageKey)
  );

  React.useEffect(() => {
    saveState(storageKey, state);
  }, [storageKey, state]);

  const addNodeFromSelection = React.useCallback(
    (selection: ConceptSelectionInfo, nodeId?: string) => {
      const id = nodeId || crypto.randomUUID();
      const baseType = inferNodeType(selection.text);
      const position = {
        x: 120 + state.nodes.length * 40,
        y: 100 + state.nodes.length * 24,
      };
      const node: ConceptNode = {
        id,
        title: selection.text.trim().slice(0, 80) || "Concept",
        linkedTextStart: selection.from,
        linkedTextEnd: selection.to,
        type: baseType,
        position,
      };
      setState((prev) => ({
        ...prev,
        nodes: [...prev.nodes, node],
        selectedNodeId: id,
        isModalOpen: true,
      }));
    },
    [state.nodes.length]
  );

  const setConceptMapFromAI = React.useCallback(
    (
      fullText: string,
      aiNodes: AIConceptMapNode[],
      aiLinks: AIConceptMapLink[]
    ) => {
      const normalizedText = fullText.toLowerCase();
      const nodeIdByIndex: string[] = [];
      const nodes: ConceptNode[] = aiNodes.map((aiNode, i) => {
        const id = crypto.randomUUID();
        nodeIdByIndex.push(id);
        const title = aiNode.title.trim().slice(0, 80) || "Concept";
        let linkedTextStart = 0;
        let linkedTextEnd = 0;
        const search = title.toLowerCase();
        if (search.length > 0) {
          const idx = normalizedText.indexOf(search);
          if (idx !== -1) {
            linkedTextStart = idx;
            linkedTextEnd = idx + title.length;
          }
        }
        const cols = Math.ceil(Math.sqrt(aiNodes.length));
        const row = Math.floor(i / cols);
        const col = i % cols;
        const position = {
          x: 80 + col * 120,
          y: 80 + row * 70,
        };
        return {
          id,
          title,
          linkedTextStart,
          linkedTextEnd,
          type: aiNode.type,
          position,
        };
      });
      const links: ConceptLink[] = aiLinks
        .filter(
          (l) =>
            l.sourceIndex >= 0 &&
            l.sourceIndex < nodes.length &&
            l.targetIndex >= 0 &&
            l.targetIndex < nodes.length &&
            l.sourceIndex !== l.targetIndex
        )
        .map((l) => ({
          id: crypto.randomUUID(),
          sourceNodeId: nodeIdByIndex[l.sourceIndex]!,
          targetNodeId: nodeIdByIndex[l.targetIndex]!,
          type: l.type,
          label: l.label,
        }));
      setState({
        nodes,
        links,
        selectedNodeId: null,
        focusedLinkId: null,
        isModalOpen: true,
      });
    },
    []
  );

  const deleteNode = React.useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.filter((n) => n.id !== id),
      links: prev.links.filter(
        (l) => l.sourceNodeId !== id && l.targetNodeId !== id
      ),
      selectedNodeId: prev.selectedNodeId === id ? null : prev.selectedNodeId,
    }));
  }, []);

  const renameNode = React.useCallback((id: string, title: string) => {
    setState((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, title } : n)),
    }));
  }, []);

  const addLink = React.useCallback(
    (
      sourceNodeId: string,
      targetNodeId: string,
      type: ConceptRelationshipType,
      label?: string
    ) => {
      if (sourceNodeId === targetNodeId) return;
      const id = crypto.randomUUID();
      const link: ConceptLink = {
        id,
        sourceNodeId,
        targetNodeId,
        type,
        label,
      };
      setState((prev) => ({
        ...prev,
        links: [...prev.links, link],
        focusedLinkId: id,
      }));
    },
    []
  );

  const deleteLink = React.useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== id),
      focusedLinkId: prev.focusedLinkId === id ? null : prev.focusedLinkId,
    }));
  }, []);

  const updateNodePosition = React.useCallback(
    (id: string, position: { x: number; y: number }) => {
      setState((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === id ? { ...n, position: { x: position.x, y: position.y } } : n
        ),
      }));
    },
    []
  );

  const setSelectedNode = React.useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedNodeId: id }));
  }, []);

  const setFocusedLink = React.useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, focusedLinkId: id }));
  }, []);

  const setModalOpen = React.useCallback((open: boolean) => {
    setState((prev) => ({ ...prev, isModalOpen: open }));
  }, []);

  const clearAll = React.useCallback(() => {
    setState({
      nodes: [],
      links: [],
      selectedNodeId: null,
      focusedLinkId: null,
      isModalOpen: false,
    });
  }, []);

  const value: ConceptMapContextValue = useMemo(
    () => ({
      state,
      addNodeFromSelection,
      setConceptMapFromAI,
      deleteNode,
      renameNode,
      addLink,
      deleteLink,
      updateNodePosition,
      setSelectedNode,
      setFocusedLink,
      setModalOpen,
      clearAll,
    }),
    [
      state,
      addNodeFromSelection,
      setConceptMapFromAI,
      deleteNode,
      renameNode,
      addLink,
      deleteLink,
      updateNodePosition,
      setSelectedNode,
      setFocusedLink,
      setModalOpen,
      clearAll,
    ]
  );

  return (
    <ConceptMapContext.Provider value={value}>
      {children}
    </ConceptMapContext.Provider>
  );
}

export function useConceptMapContext(): ConceptMapContextValue {
  const ctx = useContext(ConceptMapContext);
  if (!ctx) {
    throw new Error("useConceptMapContext must be used within ConceptMapProvider");
  }
  return ctx;
}
