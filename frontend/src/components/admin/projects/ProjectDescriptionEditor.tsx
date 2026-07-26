import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import { Icon } from "@iconify/react";

interface ProjectDescriptionEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function ProjectDescriptionEditor({ value, onChange }: ProjectDescriptionEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm md:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[150px]",
      },
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return <div className="p-4 border-2 border-black font-mono text-sm animate-pulse">Loading Editor...</div>;
  }

  return (
    <div className="border-2 border-black focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:bg-gray-50 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] bg-white">
      <div className="border-b-2 border-black bg-gray-100 flex flex-wrap gap-2 p-2">
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

        <div className="w-px h-6 bg-gray-400 my-auto mx-1"></div>

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
          title="Ordered List"
        >
          <Icon icon="lucide:list-ordered" />
        </button>

        <div className="w-px h-6 bg-gray-400 my-auto mx-1"></div>

        <button
          type="button"
          onClick={() => {
            const previousUrl = editor.getAttributes("link").href;
            const url = window.prompt("URL", previousUrl);
            if (url === null) return;
            if (url === "") {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${
            editor.isActive("link") ? "bg-black text-white" : ""
          }`}
          title="Insert Link"
        >
          <Icon icon="lucide:link" />
        </button>
      </div>

      <div className="p-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
