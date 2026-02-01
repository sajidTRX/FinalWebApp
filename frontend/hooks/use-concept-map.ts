"use client";

import { useMemo } from "react";
import { useConceptMapContext } from "@/lib/contexts/concept-map-context";
import type { ConceptSelectionInfo } from "@/lib/types/concept-map";

export function useConceptMap() {
  const ctx = useConceptMapContext();

  return useMemo(
    () => ({
      state: ctx.state,
      addNodeFromSelection: (selection: ConceptSelectionInfo, nodeId?: string) =>
        ctx.addNodeFromSelection(selection, nodeId),
      setConceptMapFromAI: ctx.setConceptMapFromAI,
      deleteNode: ctx.deleteNode,
      renameNode: ctx.renameNode,
      addLink: ctx.addLink,
      deleteLink: ctx.deleteLink,
      updateNodePosition: ctx.updateNodePosition,
      setSelectedNode: ctx.setSelectedNode,
      setFocusedLink: ctx.setFocusedLink,
      setModalOpen: ctx.setModalOpen,
      clearAll: ctx.clearAll,
    }),
    [ctx]
  );
}
