import { Node } from "@tiptap/core";

export interface CalloutOptions {
  /**
   * HTML attributes to add to the callout element.
   */
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Set a callout (border-left note) block
       */
      setCallout: () => ReturnType;
      /**
       * Toggle a callout block
       */
      toggleCallout: () => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  group: "block",

  content: "block+",

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: "div.callout",
      },
      // Backward compatibility: support legacy <blockquote class="callout">
      {
        tag: "blockquote.callout",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        class:
          "callout flex my-6 items-start border-l-0 border-neutral-300 dark:border-neutral-700 pl-6 py-1 text-sm md:text-base text-neutral-400 dark:text-neutral-500 relative",
        ...HTMLAttributes,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        () =>
        ({ commands }) => {
          return commands.wrapIn(this.name);
        },
      toggleCallout:
        () =>
        ({ commands }) => {
          return commands.toggleWrap(this.name);
        },
    };
  },
});
