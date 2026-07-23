import { Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import RawHtmlComponent from './RawHtmlComponent.vue'

export const RawHtml = Node.create({
  name: 'rawHtml',

  group: 'block',
  atom: true,

  addAttributes() {
    return {
      html: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-raw-html]',
        getAttrs: node => ({
          html: node.innerHTML,
        }),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const div = document.createElement('div')
    div.innerHTML = HTMLAttributes.html
    div.setAttribute('data-raw-html', '')
    return div
  },

  addNodeView() {
    return VueNodeViewRenderer(RawHtmlComponent)
  },

  addCommands() {
    return {
      insertRawHtml: (html) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: { html },
        })
      },
    }
  },
})
