import React from "react";
import { Icon } from "@iconify/react";
import { Editor } from "@tiptap/react";

interface BlogEditorToolbarProps {
  editor: Editor | null;
  setLink: (editor: Editor | null) => void;
  insertHtmlEmbed: (editor: Editor | null) => void;
  triggerImageUpload: () => void;
}

export default function BlogEditorToolbar({
  editor,
  setLink,
  insertHtmlEmbed,
  triggerImageUpload,
}: BlogEditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="border-4 border-black mb-[-4px] relative z-10 bg-gray-100 flex flex-wrap gap-2 p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="p-2 border-2 border-transparent hover:border-black transition-colors rounded disabled:opacity-30"
        title="Undo"
      >
        <Icon icon="lucide:undo" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="p-2 border-2 border-transparent hover:border-black transition-colors rounded disabled:opacity-30"
        title="Redo"
      >
        <Icon icon="lucide:redo" />
      </button>
      <div className="w-px h-6 bg-gray-400 my-auto mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("bold") ? "bg-black text-white" : ""
        }`}
        title="Bold"
      >
        <Icon icon="lucide:bold" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("italic") ? "bg-black text-white" : ""
        }`}
        title="Italic"
      >
        <Icon icon="lucide:italic" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("underline") ? "bg-black text-white" : ""
        }`}
        title="Underline"
      >
        <Icon icon="lucide:underline" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("strike") ? "bg-black text-white" : ""
        }`}
        title="Strikethrough"
      >
        <Icon icon="lucide:strikethrough" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("highlight") ? "bg-black text-white" : ""
        }`}
        title="Highlight"
      >
        <Icon icon="lucide:highlighter" />
      </button>
      <button
        type="button"
        onClick={() => setLink(editor)}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("link") ? "bg-black text-white" : ""
        }`}
        title="Insert Link"
      >
        <Icon icon="lucide:link" />
      </button>
      <div className="w-px h-6 bg-gray-400 my-auto mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded font-bold font-serif ${
          editor.isActive("heading", { level: 2 }) ? "bg-black text-white" : ""
        }`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded font-bold font-serif ${
          editor.isActive("heading", { level: 3 }) ? "bg-black text-white" : ""
        }`}
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("bulletList") ? "bg-black text-white" : ""
        }`}
        title="Bullet List"
      >
        <Icon icon="lucide:list" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("orderedList") ? "bg-black text-white" : ""
        }`}
        title="Numbered List"
      >
        <Icon icon="lucide:list-ordered" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("blockquote") ? "bg-black text-white" : ""
        }`}
        title="Blockquote"
      >
        <Icon icon="lucide:quote" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCallout().run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("callout") ? "bg-black text-white" : ""
        }`}
        title="Callout (Note)"
      >
        <Icon icon="lucide:file-text" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 border-2 border-transparent hover:border-black transition-colors rounded"
        title="Horizontal Rule"
      >
        <Icon icon="lucide:minus" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive("codeBlock") ? "bg-black text-white" : ""
        }`}
        title="Code Block"
      >
        <Icon icon="lucide:code" />
      </button>
      <button
        type="button"
        onClick={() => insertHtmlEmbed(editor)}
        className="p-2 border-2 border-transparent hover:border-black transition-colors rounded text-green-700 hover:bg-green-50 font-bold font-mono"
        title="Embed HTML/CSS/JS Mentah"
      >
        <Icon icon="lucide:puzzle" className="inline" /> HTML
      </button>
      <div className="w-px h-6 bg-gray-400 my-auto mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive({ textAlign: "left" }) ? "bg-black text-white" : ""
        }`}
      >
        <Icon icon="lucide:align-left" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive({ textAlign: "center" }) ? "bg-black text-white" : ""
        }`}
      >
        <Icon icon="lucide:align-center" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive({ textAlign: "right" }) ? "bg-black text-white" : ""
        }`}
      >
        <Icon icon="lucide:align-right" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
          editor.isActive({ textAlign: "justify" }) ? "bg-black text-white" : ""
        }`}
      >
        <Icon icon="lucide:align-justify" />
      </button>
      <div className="w-px h-6 bg-gray-400 my-auto mx-1"></div>
      <button
        type="button"
        onClick={triggerImageUpload}
        className="p-2 border-2 border-transparent hover:border-black transition-colors rounded text-blue-600 font-bold flex items-center gap-1"
        title="Upload Image"
      >
        <Icon icon="lucide:image" /> Upload Image
      </button>
    </div>
  );
}
