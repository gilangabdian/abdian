"use client";

import React, { useRef, useEffect } from "react";
import { Editor, useEditor, ReactNodeViewRenderer, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import CodeBlockComponent from "../blogs/editor/CodeBlockComponent";
import { RawHtml } from "../blogs/editor/RawHtml";
import { Callout } from "../blogs/editor/Callout";
import "highlight.js/styles/night-owl.css";
import BlogEditorToolbar from "../blogs/BlogEditorToolbar";
import { uploadBlogImage } from "@/lib/api/blog";

const lowlight = createLowlight(common);

interface ProfileRichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function ProfileRichTextEditor({ content, onChange }: ProfileRichTextEditorProps) {
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const setLink = (editor: Editor | null) => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL:", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const triggerImageUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const insertHtmlEmbed = async (editor: Editor | null) => {
    if (!editor) return;
    const Swal = (await import("sweetalert2")).default;
    const { value: htmlText } = await Swal.fire({
      title: "Embed HTML/CSS/JS",
      html: `
        <div class="text-left font-mono text-sm mb-2 text-gray-700">
          Kamu bisa paste kode gabungan <b>HTML</b>, <b>&lt;style&gt;</b> (CSS), dan <b>&lt;script&gt;</b> sekaligus di sini. 
          Sangat cocok untuk menyisipkan SVG Animasi atau iframe custom.
        </div>
        <textarea id="swal-input-html" class="w-full h-48 p-2 border-2 border-black font-mono text-sm" placeholder="<svg>...</svg>\n<style>...</style>"></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: "Insert Embed",
      confirmButtonColor: "#000",
      preConfirm: () => {
        const textarea = document.getElementById("swal-input-html") as HTMLTextAreaElement;
        const html = textarea ? textarea.value : "";
        if (!html) {
          Swal.showValidationMessage("Kode HTML tidak boleh kosong");
        }
        return html;
      },
    });

    if (htmlText) {
      // @ts-ignore
      editor.commands.insertRawHtml(htmlText);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, currentEditor: Editor | null) => {
    if (!currentEditor) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const Swal = (await import("sweetalert2")).default;
    Swal.fire({
      title: "Uploading image...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem("token") || "";
      const response = await uploadBlogImage(token, formData);
      const data = await response.json();

      if (response.ok && data.url) {
        currentEditor.chain().focus().setImage({ src: data.url }).run();
        Swal.close();
      } else {
        throw new Error("Gagal mendapatkan URL gambar");
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat mengunggah gambar.",
        icon: "error",
      });
    } finally {
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const extensions = React.useMemo(() => [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockLowlight.extend({
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
      },
    }).configure({ lowlight }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    ImageResize.configure({ inline: false, allowBase64: true }),
    Link.configure({ openOnClick: false }),
    Underline,
    Highlight.configure({ multicolor: true }),
    RawHtml,
    Callout,
  ], []);

  const editor = useEditor({
    extensions,
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-neutral prose-lg max-w-none min-h-[300px] outline-none p-4 md:p-8 prose-headings:font-black prose-headings:text-black prose-img:rounded-lg [&_div.callout]:flex [&_div.callout]:my-6 [&_div.callout]:items-start [&_div.callout]:border-l-0 [&_div.callout]:border-neutral-300 [&_div.callout]:relative [&_div.callout]:pl-6 [&_div.callout]:py-1 [&_div.callout]:text-sm [&_div.callout]:md:text-base [&_div.callout]:text-neutral-400 [&_div.callout]:not-italic",
      },
    },
  });

  // Watch for external content updates (like initial load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="border-4 border-black bg-white rounded flex flex-col">
      <BlogEditorToolbar
        editor={editor}
        setLink={setLink}
        insertHtmlEmbed={insertHtmlEmbed}
        triggerImageUpload={triggerImageUpload}
      />
      <div className="bg-white">
        <style>{`
          .ProseMirror div.callout {
            position: relative !important;
          }
          .ProseMirror div.callout p { color: #a3a3a3 !important; }
          .ProseMirror div.callout::before {
            content: '';
            position: absolute;
            left: 0;
            top: 1.5em;
            bottom: 1.5em;
            width: 4px;
            background: #d4d4d8;
            border-radius: 2px;
          }
          .ProseMirror blockquote {
            position: relative !important;
            border-left: none !important;
            padding-left: 1.5rem !important;
          }
          .ProseMirror blockquote::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0.5em;
            bottom: 0.5em;
            width: 4px;
            background: #d4d4d8;
            border-radius: 2px;
          }
          /* Hide empty p tag placeholders */
          .ProseMirror p.is-editor-empty:first-child::before {
            color: #9ca3af;
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
      <input
        type="file"
        ref={imageInputRef}
        onChange={(e) => handleImageUpload(e, editor)}
        className="hidden"
        accept="image/*"
      />
    </div>
  );
}
