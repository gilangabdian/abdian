import React from "react";
import { Editor, EditorContent } from "@tiptap/react";
import BlogEditorToolbar from "./BlogEditorToolbar";

interface BlogEditorProps {
  form: {
    title: string;
    title_en: string;
    content: string;
    content_en: string;
    is_published: boolean;
    is_external: boolean;
    external_url: string;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
  activeTab: "id" | "en";
  setActiveTab: (tab: "id" | "en") => void;
  editorId: Editor | null;
  editorEn: Editor | null;
  imageInputId: React.RefObject<HTMLInputElement | null>;
  imageInputEn: React.RefObject<HTMLInputElement | null>;
  triggerImageUpload: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, editor: Editor | null) => void;
  setLink: (editor: Editor | null) => void;
  insertHtmlEmbed: (editor: Editor | null) => void;
  setIsPreviewMode: (val: boolean) => void;
}

export default function BlogEditor({
  form,
  setForm,
  activeTab,
  setActiveTab,
  editorId,
  editorEn,
  imageInputId,
  imageInputEn,
  triggerImageUpload,
  handleImageUpload,
  setLink,
  insertHtmlEmbed,
  setIsPreviewMode,
}: BlogEditorProps) {
  return (
    <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-6">
      {/* Language Tabs */}
      <div className="flex gap-4 border-b-4 border-black pb-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("id")}
          className={`${
            activeTab === "id" ? "bg-black text-white" : "bg-gray-200 text-black"
          } px-4 py-2 font-bold font-mono border-2 border-black transition-colors`}>
          Bahasa Indonesia
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("en")}
          className={`${
            activeTab === "en" ? "bg-black text-white" : "bg-gray-200 text-black"
          } px-4 py-2 font-bold font-mono border-2 border-black transition-colors`}>
          English (Optional)
        </button>
      </div>

      {/* Title */}
      <div style={{ display: activeTab === "id" ? "block" : "none" }}>
        <label className="block font-bold font-mono mb-2 uppercase text-sm">
          Blog Title (ID) <span className="text-red-500">*</span>
        </label>
        <input
          value={form.title}
          onChange={(e) => setForm((prev: any) => ({ ...prev, title: e.target.value }))}
          type="text"
          placeholder="Cara Belajar Coding dengan Seru..."
          className="w-full p-3 border-4 border-black text-lg focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
        />
      </div>
      <div style={{ display: activeTab === "en" ? "block" : "none" }}>
        <label className="block font-bold font-mono mb-2 uppercase text-sm">
          Blog Title (EN) <span className="text-red-500">*</span>
        </label>
        <input
          value={form.title_en}
          onChange={(e) => setForm((prev: any) => ({ ...prev, title_en: e.target.value }))}
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
              onChange={(e) => setForm((prev: any) => ({ ...prev, is_external: e.target.checked }))}
              className="sr-only"
            />
            <div
              className={`${
                form.is_external ? "bg-black" : "bg-gray-300"
              } block w-14 h-8 transition-colors border-2 border-black`}></div>
            <div
              className={`${
                form.is_external ? "translate-x-6" : "translate-x-0"
              } dot absolute left-1 top-1 bg-white w-6 h-6 transition-transform border-2 border-black`}></div>
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
            onChange={(e) => setForm((prev: any) => ({ ...prev, external_url: e.target.value }))}
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
            <BlogEditorToolbar
              editor={editorId}
              setLink={setLink}
              insertHtmlEmbed={insertHtmlEmbed}
              triggerImageUpload={triggerImageUpload}
            />
            <input
              type="file"
              ref={imageInputId}
              onChange={(e) => handleImageUpload(e, editorId)}
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
              `}</style>
              <EditorContent editor={editorId} />
            </div>
          </div>

          <div style={{ display: activeTab === "en" ? "block" : "none" }}>
            <BlogEditorToolbar
              editor={editorEn}
              setLink={setLink}
              insertHtmlEmbed={insertHtmlEmbed}
              triggerImageUpload={triggerImageUpload}
            />
            <input
              type="file"
              ref={imageInputEn}
              onChange={(e) => handleImageUpload(e, editorEn)}
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
              `}</style>
              <EditorContent editor={editorEn} />
            </div>
          </div>
        </div>
      )}

      {/* Status & Preview Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t-4 border-black">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm((prev: any) => ({ ...prev, is_published: e.target.checked }))}
              className="sr-only"
            />
            <div
              className={`${
                form.is_published ? "bg-black" : "bg-gray-300"
              } block w-14 h-8 transition-colors border-2 border-black`}></div>
            <div
              className={`${
                form.is_published ? "translate-x-6" : "translate-x-0"
              } dot absolute left-1 top-1 bg-white w-6 h-6 transition-transform border-2 border-black`}></div>
          </div>
          <span className="font-bold font-mono">{form.is_published ? "Publish immediately" : "Save as Draft"}</span>
        </label>

        <button
          type="button"
          onClick={() => setIsPreviewMode(true)}
          className="bg-black text-white px-8 py-3 font-black tracking-widest uppercase border-4 border-black hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          Preview Blog
        </button>
      </div>
    </div>
  );
}
