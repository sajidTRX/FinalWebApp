import { Mark, mergeAttributes } from "@tiptap/core";

export interface ConceptHighlightOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    conceptHighlight: {
      /**
       * Set concept highlight mark
       */
      setConceptHighlight: (nodeId: string) => ReturnType;
      /**
       * Unset concept highlight mark
       */
      unsetConceptHighlight: () => ReturnType;
      /**
       * Toggle concept highlight mark
       */
      toggleConceptHighlight: (nodeId: string) => ReturnType;
    };
  }
}

export const ConceptHighlight = Mark.create<ConceptHighlightOptions>({
  name: "conceptHighlight",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      "data-concept-id": {
        default: null,
        parseHTML: (element) => element.getAttribute("data-concept-id"),
        renderHTML: (attributes) => {
          if (!attributes["data-concept-id"]) {
            return {};
          }
          return {
            "data-concept-id": attributes["data-concept-id"],
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "mark[data-concept-id]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "mark",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "concept-highlight",
        style:
          "background-color: #e8dcc8; border-radius: 2px; padding: 0 2px; border-bottom: 2px solid #c4a574;",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setConceptHighlight:
        (nodeId: string) =>
        ({ commands }) => {
          return commands.setMark(this.name, { "data-concept-id": nodeId });
        },
      unsetConceptHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name);
        },
      toggleConceptHighlight:
        (nodeId: string) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, { "data-concept-id": nodeId });
        },
    };
  },
});
