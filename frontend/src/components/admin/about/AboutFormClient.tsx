"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Editor, useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageResize from "tiptap-extension-resize-image";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import CodeBlockComponent from "@/components/admin/blogs/editor/CodeBlockComponent";
import { RawHtml } from "@/components/admin/blogs/editor/RawHtml";
import { Callout } from "@/components/admin/blogs/editor/Callout";
import BlogEditorToolbar from "@/components/admin/blogs/BlogEditorToolbar";
import "highlight.js/styles/night-owl.css";
import { Icon } from "@iconify/react";
import { alertSuccess, alertError } from "@/lib/alert";
import { getAboutPage, updateAboutPage } from "@/lib/api/about";
import { formatGithubLinks } from "@/lib/github-link-formatter";

const lowlight = createLowlight(common);

export default function AboutFormClient() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [content, setContent] = useState("");

  const imageInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      setIsLoading(true);
      try {
        const response = await getAboutPage();
        if (response?.data?.content) {
          setContent(response.data.content);
        }
      } catch (error) {
        // No about data yet, that's fine
      } finally {
        setIsLoading(false);
      }
    };
    fetchAbout();
  }, []);

  const extensions = React.useMemo(
    () => [
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
      Callout,
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[300px] outline-none p-4 md:p-8 font-[Inter] text-sm md:text-base leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black prose-a:no-underline prose-a:text-black hover:prose-a:underline prose-a:decoration-black/20 hover:prose-a:decoration-black prose-a:underline-offset-4 prose-a:transition-all prose-a:duration-300 prose-img:rounded-lg prose-img:my-4 prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-code:text-neutral-800 prose-blockquote:border-l-4 prose-blockquote:border-neutral-300 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:text-neutral-400 prose-blockquote:not-italic prose-blockquote:my-6 [&_div.callout]:flex [&_div.callout]:my-6 [&_div.callout]:items-start [&_div.callout]:border-l-0 [&_div.callout]:border-neutral-300 [&_div.callout]:relative [&_div.callout]:pl-6 [&_div.callout]:py-1 [&_div.callout]:text-sm [&_div.callout]:md:text-base [&_div.callout]:text-neutral-400 [&_div.callout]:not-italic [&_p:empty]:min-h-[1.5em] [&_p:empty]:block",
      },
      transformPastedHTML(html) {
        // Prevent pasted text from being auto-converted to code snippets.
        // When copying from browsers/devtools, the clipboard HTML often
        // contains <code> tags that ProseMirror interprets as inline code.
        // Replace <code> → <span> and <pre> → <div> to strip formatting.
        return html
          .replace(/<code(?:\s[^>]*)?>/gi, "<span>")
          .replace(/<\/code>/gi, "</span>")
          .replace(/<pre(?:\s[^>]*)?>/gi, "<div>")
          .replace(/<\/pre>/gi, "</div>");
      },
      transformPastedText(text) {
        // Prevent plain text paste from being auto-detected as code block.
        // ProseMirror treats lines with 4+ leading spaces as code blocks.
        return text.replace(/\t/g, "  ").replace(/^ {4,}/gm, "");
      },
    },
  });

  useEffect(() => {
    if (editor && !isLoading && content) {
      editor.commands.setContent(content || "");
    }
  }, [editor, isLoading]);

  // Format GitHub links in the preview when it is open
  useEffect(() => {
    if (isPreviewOpen) {
      const container = document.getElementById("about-preview-container");
      if (container) {
        formatGithubLinks(container);
      }
    }
  }, [isPreviewOpen, content]);

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
    if (imageInput.current) {
      imageInput.current.click();
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, editor: Editor | null) => {
    if (!editor) return;
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
      const { uploadBlogImage } = await import("@/lib/api/blog");
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
        <textarea id="swal-input-html" class="w-full h-48 p-2 border-2 border-black font-mono text-sm" placeholder="<svg>...</svg>\\n<style>...</style>"></textarea>
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

  const saveAbout = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await updateAboutPage(token, content || "");

      if (response.ok) {
        await alertSuccess("About page updated successfully!");
        router.push("/admin/dashboard");
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

  if (isLoading) {
    return <div className="text-center font-mono py-8 text-black">Loading about page data...</div>;
  }

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Edit About Page</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="bg-gray-200 text-black px-4 py-2 font-bold font-mono border-4 border-black hover:bg-black hover:text-white transition-colors cursor-pointer">
          Back
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveAbout();
        }}>
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
          {/* Editor */}
          <div>
            <label className="block font-bold font-mono mb-2 uppercase text-sm">Content</label>
            <BlogEditorToolbar
              editor={editor}
              setLink={setLink}
              insertHtmlEmbed={insertHtmlEmbed}
              triggerImageUpload={triggerImageUpload}
            />
            <input
              type="file"
              ref={imageInput}
              onChange={(e) => handleImageUpload(e, editor)}
              accept="image/*"
              className="hidden"
            />
            <div className="border-4 border-black bg-white min-h-[300px]">
              <style>{`
                .ProseMirror div.callout {
                  position: relative !important;
                }
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
                /* Custom blockquote styling to match callout border */
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
                                /* Links: selalu mode terang karena background editor putih pekat */
                .ProseMirror a { font-weight: 600 !important; color: #000000 !important; text-decoration: underline !important; text-decoration-color: #d4d4d8 !important; text-underline-offset: 2px !important; transition: all 0.2s ease-in-out; }
                .ProseMirror a:hover { text-decoration-color: #171717 !important; }

              `}</style>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t-4 border-black">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex-1 py-3 bg-white text-black border-2 border-black font-black text-base uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex items-center justify-center gap-2">
              <Icon icon="lucide:eye" className="text-xl" />
              Preview
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="flex-1 py-3 bg-gray-200 text-black font-bold font-mono border-4 border-black hover:bg-black hover:text-white transition-colors cursor-pointer">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-[2] bg-black text-white px-8 py-3 font-black tracking-widest uppercase border-4 border-black hover:bg-white hover:text-black transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
              {isSaving ? (
                <>
                  <Icon icon="svg-spinners:3-dots-fade" className="text-xl" />
                  Saving...
                </>
              ) : (
                <>
                  <Icon icon="lucide:save" className="text-xl" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ── Preview Overlay ── */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] bg-white dark:bg-neutral-950 overflow-y-auto">
          {/* Preview Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-neutral-950 border-b-4 border-black dark:border-white p-4 flex justify-between items-center shadow-md">
            <h2 className="font-black italic uppercase text-xl md:text-2xl flex items-center gap-2 text-black dark:text-white">
              <Icon icon="lucide:eye" className="text-2xl" />
              About Preview
            </h2>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-2 bg-black text-white font-bold uppercase border-2 border-black hover:bg-white hover:text-black transition-colors flex items-center gap-2">
              <Icon icon="lucide:x" />
              Close
            </button>
          </div>

          {/* Preview Body — sama persis styling halaman publik /about */}
          <section className="min-h-screen flex justify-center py-24 px-4 sm:px-6 font-sans text-black dark:text-white">
            <div className="container max-w-[650px] w-full flex flex-col mt-10 mx-auto">
              <div className="flex flex-col space-y-4">
                <span className="text-sm md:text-base text-neutral-500 dark:text-neutral-500">
                  Preview — belum disimpan
                </span>

                <style>{`
                  div.callout {
                    position: relative !important;
                  }
                  div.callout::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 1.5em;
                    bottom: 1.5em;
                    width: 4px;
                    background: #d4d4d8;
                    border-radius: 2px;
                  }
                  .dark div.callout::before {
                    background: #404040;
                  }
                  /* Custom blockquote styling to match callout border */
                  .prose blockquote {
                    position: relative !important;
                    border-left: none !important;
                    padding-left: 1.5rem !important;
                  }
                  .prose blockquote::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0.5em;
                    bottom: 0.5em;
                    width: 4px;
                    background: #d4d4d8;
                    border-radius: 2px;
                  }
                                    .dark .prose blockquote::before {
                    background: #404040;
                  }
                  /* Links: menyala di dark mode dan ada underline standby */
                  .prose a { font-weight: 600 !important; color: #000000 !important; text-decoration: underline !important; text-decoration-color: #d4d4d8 !important; text-underline-offset: 2px !important; transition: all 0.2s ease-in-out; }
                  .dark .prose a { color: #e5e5e5 !important; text-decoration-color: #3f3f46 !important; }
                  .prose a:hover { text-decoration-color: #171717 !important; }
                  .dark .prose a:hover { text-decoration-color: #e5e5e5 !important; }
                `}</style>

                <div
                  id="about-preview-container"
                  className="prose prose-neutral dark:prose-invert max-w-none mt-4 text-sm md:text-base leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black dark:prose-headings:text-white prose-a:underline prose-a:text-black dark:prose-a:text-white prose-a:decoration-black/20 dark:prose-a:decoration-white/20 hover:prose-a:decoration-black dark:hover:prose-a:decoration-white prose-a:underline-offset-4 prose-a:transition-all prose-a:duration-300 prose-img:rounded-lg prose-img:my-4 prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-code:text-neutral-800 dark:prose-code:text-neutral-200 prose-blockquote:border-l-4 prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-700 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:text-neutral-400 dark:prose-blockquote:text-neutral-500 prose-blockquote:not-italic prose-blockquote:my-6 [&_div.callout]:flex [&_div.callout]:my-6 [&_div.callout]:items-start [&_div.callout]:border-l-0 [&_div.callout]:border-neutral-300 [&_div.callout]:dark:border-neutral-700 [&_div.callout]:relative [&_div.callout]:pl-6 [&_div.callout]:py-1 [&_div.callout]:text-sm [&_div.callout]:md:text-base [&_div.callout]:text-neutral-400 [&_div.callout]:dark:text-neutral-500 [&_div.callout]:not-italic [&_p:empty]:min-h-[1.5em] [&_p:empty]:block"
                  dangerouslySetInnerHTML={{ __html: content || "" }}
                />
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
