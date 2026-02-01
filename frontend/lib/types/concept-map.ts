export type ConceptNodeType = "character" | "theme" | "idea" | "place" | "default";

export type ConceptRelationshipType =
  | "causes"
  | "supports"
  | "conflicts"
  | "relates-to"
  | "contrasts"
  | "extends";

export interface ConceptNodePosition {
  x: number;
  y: number;
}

export interface ConceptNode {
  id: string;
  title: string;
  linkedTextStart: number;
  linkedTextEnd: number;
  type: ConceptNodeType;
  position: ConceptNodePosition;
}

export interface ConceptLink {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  type: ConceptRelationshipType;
  label?: string;
}

export interface ConceptMapData {
  nodes: ConceptNode[];
  links: ConceptLink[];
}

export interface ConceptSelectionInfo {
  text: string;
  from: number;
  to: number;
}

export interface ConceptMapState extends ConceptMapData {
  selectedNodeId: string | null;
  focusedLinkId: string | null;
  isModalOpen?: boolean;
}
