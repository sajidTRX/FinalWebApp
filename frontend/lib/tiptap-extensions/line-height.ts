import { Extension } from '@tiptap/core';

export interface LineHeightOptions {
  types: string[];
  defaultLineHeight: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    lineHeight: {
      /**
       * Set the line height
       */
      setLineHeight: (lineHeight: string) => ReturnType;
      /**
       * Unset the line height
       */
      unsetLineHeight: () => ReturnType;
    };
  }
}

export const LineHeight = Extension.create<LineHeightOptions>({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      defaultLineHeight: '1.6',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: this.options.defaultLineHeight,
            parseHTML: (element) => element.style.lineHeight || this.options.defaultLineHeight,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight:
        (lineHeight: string) =>
        ({ commands }) => {
          return commands.updateAttributes('paragraph', { lineHeight }) ||
                 commands.updateAttributes('heading', { lineHeight });
        },
      unsetLineHeight:
        () =>
        ({ commands }) => {
          return commands.updateAttributes('paragraph', { lineHeight: this.options.defaultLineHeight }) ||
                 commands.updateAttributes('heading', { lineHeight: this.options.defaultLineHeight });
        },
    };
  },
});

