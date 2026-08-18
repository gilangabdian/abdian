"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Editor, useEditor, ReactNodeViewRenderer } from "@tiptap/react";
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
import { Callout } from "./editor/Callout";
import "highlight.js/styles/night-owl.css";
import { alertSuccess, alertError } from "@/lib/alert";
import { getBlogByIdAdmin, createBlog, updateBlog, uploadBlogImage } from "@/lib/api/blog";

import BlogEditor from "./BlogEditor";
import BlogPreview from "./BlogPreview";

const lowlight = createLowlight(common);

export default function BlogFormClient({ isEdit = false }: { isEdit?: boolean }) {
  const router = useRouter();
  const params = useParams();
  const blogId = params?.id as string;

  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [form, setForm] = useState({
    title: "",
    title_en: "",
    content: "",
    content_en: "",
    is_published: true,
    is_external: false,
    external_url: "",
    type: "blog",
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
              type: blogData.type || "blog",
            });
          }
        } catch (error) {
          console.error(error);
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

  const extensionsId = React.useMemo(() => [
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
  ], []);

  const extensionsEn = React.useMemo(() => [
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
  ], []);

  const editorId = useEditor({
    extensions: extensionsId,
    content: form.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: "prose prose-neutral prose-lg max-w-none min-h-[300px] outline-none p-4 md:p-8 font-[Inter] prose-headings:font-black prose-headings:text-black prose-img:rounded-lg [&_div.callout]:flex [&_div.callout]:my-6 [&_div.callout]:items-start [&_div.callout]:border-l-0 [&_div.callout]:border-neutral-300 [&_div.callout]:relative [&_div.callout]:pl-6 [&_div.callout]:py-1 [&_div.callout]:text-sm [&_div.callout]:md:text-base [&_div.callout]:text-neutral-400 [&_div.callout]:not-italic",
      },
    },
  });

  const editorEn = useEditor({
    extensions: extensionsEn,
    content: form.content_en,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setForm((prev) => ({ ...prev, content_en: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: "prose prose-neutral prose-lg max-w-none min-h-[300px] outline-none p-4 md:p-8 font-[Inter] prose-headings:font-black prose-headings:text-black prose-img:rounded-lg [&_div.callout]:flex [&_div.callout]:my-6 [&_div.callout]:items-start [&_div.callout]:border-l-0 [&_div.callout]:border-neutral-300 [&_div.callout]:relative [&_div.callout]:pl-6 [&_div.callout]:py-1 [&_div.callout]:text-sm [&_div.callout]:md:text-base [&_div.callout]:text-neutral-400 [&_div.callout]:not-italic",
      },
    },
  });

  useEffect(() => {
    if (editorId && editorEn && !isLoading && !initialContentSet && isEdit) {
      const timer = setTimeout(() => {
        editorId.commands.setContent(form.content || "");
        editorEn.commands.setContent(form.content_en || "");
        setInitialContentSet(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [editorId, editorEn, isLoading, initialContentSet, isEdit, form.content, form.content_en]);

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
      const response = await uploadBlogImage(token, formData);
      const data = await response.json();

      if (response.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
        Swal.close();
      } else {
        throw new Error("Gagal mendapatkan URL gambar");
      }
    } catch (err) {
      console.error(err);
      alertError("Gagal mengunggah gambar");
    }

    event.target.value = "";
  };

  const saveBlog = async () => {
    if (form.type === "blog" && !form.title) {
      alertError("Judul tidak boleh kosong untuk Blog");
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
      formData.append("type", form.type);
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

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black tracking-tighter uppercase">{isEdit ? "Edit" : "Write"} Blog</h1>
        <button
          onClick={() => router.push("/admin/blogs")}
          className="bg-gray-200 text-black px-4 py-2 font-bold font-mono border-4 border-black hover:bg-black hover:text-white transition-colors"
        >
          Back
        </button>
      </div>

      {isLoading ? (
        <div className="text-center font-mono py-8">Loading data...</div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveBlog();
          }}
        >
          {isPreviewMode ? (
            <BlogPreview
              title={form.title}
              title_en={form.title_en}
              content={form.content}
              content_en={form.content_en}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setIsPreviewMode={setIsPreviewMode}
              handleSubmit={(e) => {
                e.preventDefault();
                saveBlog();
              }}
              isSaving={isSaving}
            />
          ) : (
            <BlogEditor
              form={form}
              setForm={setForm}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              editorId={editorId}
              editorEn={editorEn}
              imageInputId={imageInputId}
              imageInputEn={imageInputEn}
              triggerImageUpload={triggerImageUpload}
              handleImageUpload={handleImageUpload}
              setLink={setLink}
              insertHtmlEmbed={insertHtmlEmbed}
              setIsPreviewMode={setIsPreviewMode}
            />
          )}
        </form>
      )}
    </div>
  );
}
