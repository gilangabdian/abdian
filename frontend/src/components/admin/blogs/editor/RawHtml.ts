import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import RawHtmlComponent from './RawHtmlComponent';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    rawHtml: {
      insertRawHtml: (html: string) => ReturnType;
    };
  }
}

export const RawHtml = Node.create({
  name: 'rawHtml',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      html: {
        default: '',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-raw-html]',
        getAttrs: (node) => ({
          html: (node as HTMLElement).innerHTML,
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const div = document.createElement('div');
    div.innerHTML = HTMLAttributes.html;
    div.setAttribute('data-raw-html', '');
    return div;
  },

  addNodeView() {
    return ReactNodeViewRenderer(RawHtmlComponent);
  },

  addCommands() {
    return {
      insertRawHtml: (html) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { html },
        });
      },
    };
  },
});
