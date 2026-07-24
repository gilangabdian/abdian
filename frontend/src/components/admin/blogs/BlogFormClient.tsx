"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Editor, EditorContent, useEditor, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import CodeBlockComponent from "./editor/CodeBlockComponent";
import { RawHtml } from "./editor/RawHtml";
import "highlight.js/styles/night-owl.css";
import { alertSuccess, alertError } from "@/lib/alert";
import { getBlogByIdAdmin, createBlog, updateBlog, uploadBlogImage } from "@/lib/api/blog";

const lowlight = createLowlight(common);

export default function BlogFormClient({ isEdit = false }: { isEdit?: boolean }) {
  const router = useRouter();
  const params = useParams();
  const blogId = params?.id as string;

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");

  const [form, setForm] = useState({
    title: "",
    title_en: "",
    content: "",
    content_en: "",
    is_published: true,
    is_external: false,
    external_url: "",
  });

  const imageInputId = useRef<HTMLInputElement | null>(null);
  const imageInputEn = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEdit && blogId) {
      const fetchBlog = async () => {
        setIsLoading(true);
        try {
          const token = localStorage.getItem("token") || "";
          const data = await getBlogByIdAdmin(token, blogId);
          if (data) {
            const blogData = data as any;
            setForm({
              title: blogData.title || "",
              title_en: blogData.title_en || "",
              content: blogData.content || "",
              content_en: blogData.content_en || "",
              is_published: blogData.is_published,
              is_external: blogData.is_external || false,
              external_url: blogData.external_url || "",
            });
          }
        } catch (error) {
          alertError("Gagal memuat data blog");
          router.push("/admin/blogs");
        } finally {
          setIsLoading(false);
        }
      };
      fetchBlog();
    }
  }, [isEdit, blogId, router]);

  const [initialContentSet, setInitialContentSet] = useState(false);

  const extensions = [
    StarterKit.configure({
      codeBlock: false,
    }),
    CodeBlockLowlight.extend({
      addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
      },
    }).configure({ lowlight }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    ImageResize.configure({
      inline: false,
      allowBase64: true,
    }),
    Link.configure({ openOnClick: false }),
    Underline,
    Highlight.configure({ multicolor: true }),
    RawHtml,
  ];

  const editorId = useEditor({
    extensions,
    content: form.content,
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[300px] outline-none p-4 font-[Inter]",
      },
    },
  });

  const editorEn = useEditor({
    extensions,
    content: form.content_en,
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, content_en: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[300px] outline-none p-4 font-[Inter]",
      },
    },
  });

  useEffect(() => {
    if (editorId && editorEn && !isLoading && !initialContentSet && isEdit) {
      // Small delay to ensure <EditorContent> is mounted before setting content
      const timer = setTimeout(() => {
        editorId.commands.setContent(form.content || "");
        editorEn.commands.setContent(form.content_en || "");
        setInitialContentSet(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editorId, editorEn, isLoading, initialContentSet, isEdit, form.content, form.content_en]);

  // Since React uses functional components, we need a slight adjustment for the CodeBlockComponent node view.
  // Actually, Tiptap ReactNodeViewRenderer is already used inside RawHtml.ts, but for CodeBlock we can use ReactNodeViewRenderer.
  // Wait, I will fix the CodeBlock component registration in a useEffect or directly.
  
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
    if (activeTab === "id" && imageInputId.current) {
      imageInputId.current.click();
    } else if (activeTab === "en" && imageInputEn.current) {
      imageInputEn.current.click();
    }
  };

  const insertHtmlEmbed = async (editor: Editor | null) => {
    if (!editor) return;
    const Swal = (await import('sweetalert2')).default;
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, editor: Editor | null) => {
    if (!editor) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const Swal = (await import('sweetalert2')).default;
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
        editor.chain().focus().setImage({ src: data.url }).run();
        Swal.close();
      } else {
        throw new Error("Gagal mendapatkan URL gambar");
      }
    } catch (err) {
      alertError("Gagal mengunggah gambar");
    }

    event.target.value = "";
  };

  const saveBlog = async () => {
    if (!form.title) {
      alertError("Judul tidak boleh kosong");
      return;
    }
    if (form.is_external && !form.external_url) {
      alertError("URL Eksternal wajib diisi");
      return;
    }
    if (!form.is_external && !form.content) {
      alertError("Konten tidak boleh kosong");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("title_en", form.title_en || "");
      formData.append("content", form.content || "");
      formData.append("content_en", form.content_en || "");
      formData.append("is_published", form.is_published ? "1" : "0");
      formData.append("is_external", form.is_external ? "1" : "0");
      formData.append("external_url", form.external_url || "");
      if (isEdit) formData.append("_method", "PUT");

      let response;
      if (isEdit) {
        response = await updateBlog(token, blogId, formData);
      } else {
        response = await createBlog(token, formData);
      }

      if (response.ok) {
        await alertSuccess(isEdit ? "Blog diperbarui" : "Blog ditambahkan");
        router.push("/admin/blogs");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan data");
      }
    } catch (error: any) {
      alertError(error.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  const renderToolbar = (editor: Editor | null, inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (!editor) return null;
    return (
      <div className="border-4 border-black mb-[-4px] relative z-10 bg-gray-100 flex flex-wrap gap-2 p-2">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="p-2 border-2 border-transparent hover:border-black transition-colors rounded disabled:opacity-30" title="Undo"><Icon icon="lucide:undo" /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="p-2 border-2 border-transparent hover:border-black transition-colors rounded disabled:opacity-30" title="Redo"><Icon icon="lucide:redo" /></button>
        <div className="w-px h-6 bg-gray-400 my-auto mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive('bold') ? 'bg-black text-white' : ''}`} title="Bold"><Icon icon="lucide:bold" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive('italic') ? 'bg-black text-white' : ''}`} title="Italic"><Icon icon="lucide:italic" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive('underline') ? 'bg-black text-white' : ''}`} title="Underline"><Icon icon="lucide:underline" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive('strike') ? 'bg-black text-white' : ''}`} title="Strikethrough"><Icon icon="lucide:strikethrough" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHighlight().run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive('highlight') ? 'bg-black text-white' : ''}`} title="Highlight"><Icon icon="lucide:highlighter" /></button>
        <button type="button" onClick={() => setLink(editor)} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive('link') ? 'bg-black text-white' : ''}`} title="Insert Link"><Icon icon="lucide:link" /></button>
        <div className="w-px h-6 bg-gray-400 my-auto mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded font-bold font-serif ${editor.isActive('heading', { level: 2 }) ? 'bg-black text-white' : ''}`}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded font-bold font-serif ${editor.isActive('heading', { level: 3 }) ? 'bg-black text-white' : ''}`}>H3</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive('bulletList') ? 'bg-black text-white' : ''}`} title="Bullet List"><Icon icon="lucide:list" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive('orderedList') ? 'bg-black text-white' : ''}`} title="Numbered List"><Icon icon="lucide:list-ordered" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive('blockquote') ? 'bg-black text-white' : ''}`} title="Blockquote"><Icon icon="lucide:quote" /></button>
        <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="p-2 border-2 border-transparent hover:border-black transition-colors rounded" title="Horizontal Rule"><Icon icon="lucide:minus" /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive('codeBlock') ? 'bg-black text-white' : ''}`} title="Code Block"><Icon icon="lucide:code" /></button>
        <button type="button" onClick={() => insertHtmlEmbed(editor)} className="p-2 border-2 border-transparent hover:border-black transition-colors rounded text-green-700 hover:bg-green-50 font-bold font-mono" title="Embed HTML/CSS/JS Mentah"><Icon icon="lucide:puzzle" className="inline" /> HTML</button>
        <div className="w-px h-6 bg-gray-400 my-auto mx-1"></div>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-black text-white' : ''}`}><Icon icon="lucide:align-left" /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-black text-white' : ''}`}><Icon icon="lucide:align-center" /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-2 border-2 border-transparent hover:border-black transition-colors rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-black text-white' : ''}`}><Icon icon="lucide:align-right" /></button>
        <div className="w-px h-6 bg-gray-400 my-auto mx-2"></div>
        <button type="button" onClick={triggerImageUpload} className="p-2 border-2 border-transparent hover:border-black transition-colors rounded text-blue-600 hover:bg-blue-50" title="Insert Image"><Icon icon="lucide:image-plus" /></button>
        <input type="file" ref={inputRef} onChange={(e) => handleImageUpload(e, editor)} accept="image/*" className="hidden" />
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black tracking-tighter uppercase">{isEdit ? "Edit" : "Write"} Blog</h1>
        <button
          onClick={() => router.push('/admin/blogs')}
          className="bg-gray-200 text-black px-4 py-2 font-bold font-mono border-4 border-black hover:bg-black hover:text-white transition-colors"
        >
          Back
        </button>
      </div>

      {isLoading ? (
        <div className="text-center font-mono py-8">Loading data...</div>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); saveBlog(); }}
          className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6"
        >
          {/* Language Tabs */}
          <div className="flex gap-4 border-b-4 border-black pb-2 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab("id")}
              className={`${
                activeTab === "id" ? "bg-black text-white" : "bg-gray-200 text-black"
              } px-4 py-2 font-bold font-mono border-2 border-black transition-colors`}
            >
              Bahasa Indonesia
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`${
                activeTab === "en" ? "bg-black text-white" : "bg-gray-200 text-black"
              } px-4 py-2 font-bold font-mono border-2 border-black transition-colors`}
            >
              English (Optional)
            </button>
          </div>

          {/* Title */}
          <div style={{ display: activeTab === "id" ? "block" : "none" }}>
            <label className="block font-bold font-mono mb-2 uppercase text-sm">Blog Title (ID) <span className="text-red-500">*</span></label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              type="text"
              placeholder="Cara Belajar Coding dengan Seru..."
              className="w-full p-3 border-4 border-black text-lg focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
            />
          </div>
          <div style={{ display: activeTab === "en" ? "block" : "none" }}>
            <label className="block font-bold font-mono mb-2 uppercase text-sm">Blog Title (EN) <span className="text-red-500">*</span></label>
            <input
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
              type="text"
              placeholder="How to Learn Coding the Fun Way..."
              className="w-full p-3 border-4 border-black text-lg focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
            />
          </div>

          {/* External Link Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.is_external}
                  onChange={(e) => setForm({ ...form, is_external: e.target.checked })}
                  className="sr-only"
                />
                <div
                  className={`${
                    form.is_external ? "bg-black" : "bg-gray-300"
                  } block w-14 h-8 transition-colors border-2 border-black`}
                ></div>
                <div
                  className={`${
                    form.is_external ? "translate-x-6" : "translate-x-0"
                  } dot absolute left-1 top-1 bg-white w-6 h-6 transition-transform border-2 border-black`}
                ></div>
              </div>
              <span className="font-bold font-mono">Link ke Artikel Luar (Medium/Dev.to)</span>
            </label>
          </div>

          {/* External URL Input */}
          {form.is_external && (
            <div>
              <label className="block font-bold font-mono mb-2 uppercase text-sm">External URL</label>
              <input
                value={form.external_url}
                onChange={(e) => setForm({ ...form, external_url: e.target.value })}
                type="url"
                placeholder="https://medium.com/..."
                className="w-full p-3 border-4 border-black text-lg focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
              />
            </div>
          )}

          {/* Editor */}
          {!form.is_external && (
            <div>
              <label className="block font-bold font-mono mb-2 uppercase text-sm">Content</label>
              
              <div style={{ display: activeTab === "id" ? "block" : "none" }}>
                {renderToolbar(editorId, imageInputId)}
                <div className="border-4 border-black bg-white min-h-[300px]">
                  <EditorContent editor={editorId} />
                </div>
              </div>

              <div style={{ display: activeTab === "en" ? "block" : "none" }}>
                {renderToolbar(editorEn, imageInputEn)}
                <div className="border-4 border-black bg-white min-h-[300px]">
                  <EditorContent editor={editorEn} />
                </div>
              </div>
            </div>
          )}

          {/* Status & Submit */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t-4 border-black">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="sr-only"
                />
                <div
                  className={`${
                    form.is_published ? "bg-black" : "bg-gray-300"
                  } block w-14 h-8 transition-colors border-2 border-black`}
                ></div>
                <div
                  className={`${
                    form.is_published ? "translate-x-6" : "translate-x-0"
                  } dot absolute left-1 top-1 bg-white w-6 h-6 transition-transform border-2 border-black`}
                ></div>
              </div>
              <span className="font-bold font-mono">
                {form.is_published ? "Publish immediately" : "Save as Draft"}
              </span>
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-black text-white px-8 py-3 font-bold font-mono uppercase tracking-widest border-4 border-black hover:bg-white hover:text-black transition-colors w-full sm:w-auto disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Blog"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
