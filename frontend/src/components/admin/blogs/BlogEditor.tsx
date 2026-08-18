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
    type: string;
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

      {/* Post Type */}
      <div className="bg-gray-100 p-4 border-4 border-black mb-6">
        <label className="block font-bold font-mono mb-2 uppercase text-sm">Post As</label>
        <select
          value={form.type}
          onChange={(e) => setForm((prev: any) => ({ ...prev, type: e.target.value }))}
          className="w-full p-2 border-4 border-black text-lg bg-white focus:outline-none focus:ring-4 focus:ring-gray-300 font-mono font-bold cursor-pointer"
        >
          <option value="blog">Blog</option>
          <option value="note">Note</option>
        </select>
      </div>

      {/* Title */}
      <div style={{ display: activeTab === "id" ? "block" : "none" }}>
        <label className="block font-bold font-mono mb-2 uppercase text-sm">
          {form.type === "note" ? "Note Title (ID) (Optional)" : "Blog Title (ID) *"}
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
          {form.type === "note" ? "Note Title (EN) (Optional)" : "Blog Title (EN) *"}
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
                .ProseMirror p:empty::before { content: "\\00a0"; display: inline-block; }
                .ProseMirror p { color: #52525b !important; font-size: 16px; line-height: 28px }
                .ProseMirror a { font-weight: 600 !important; color: #000000 !important; text-decoration: underline !important; text-decoration-color: #d4d4d8 !important; text-underline-offset: 2px !important; transition: all 0.2s ease-in-out; }
                .ProseMirror a:hover { text-decoration-color: #171717 !important; }
                .ProseMirror img { display: block; margin: 1.5em auto; max-width: 100%; height: auto; }
                .ProseMirror h2, .ProseMirror h3 { position: relative;  font-weight:normal; }
                .ProseMirror h2::before, .ProseMirror h3::before { content: "#"; position: absolute; left: -1em; opacity: 0; color: #a3a3a3; transition: opacity 0.2s ease-in-out; }
                .ProseMirror h2:hover::before, .ProseMirror h3:hover::before { opacity: 1; }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
                .ProseMirror li { margin-bottom: 0.5em; }
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
                .ProseMirror p:empty::before { content: "\\00a0"; display: inline-block; }
                .ProseMirror p { color: #52525b !important; font-size: 16px; line-height: 28px }
                .ProseMirror a { font-weight: 600 !important; color: #000000 !important; text-decoration: underline !important; text-decoration-color: #d4d4d8 !important; text-underline-offset: 2px !important; transition: all 0.2s ease-in-out; }
                .ProseMirror a:hover { text-decoration-color: #171717 !important; }
                .ProseMirror img { display: block; margin: 1.5em auto; max-width: 100%; height: auto; }
                .ProseMirror h2, .ProseMirror h3 { position: relative;  font-weight:normal; }
                .ProseMirror h2::before, .ProseMirror h3::before { content: "#"; position: absolute; left: -1em; opacity: 0; color: #a3a3a3; transition: opacity 0.2s ease-in-out; }
                .ProseMirror h2:hover::before, .ProseMirror h3:hover::before { opacity: 1; }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
                .ProseMirror li { margin-bottom: 0.5em; }
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

      {/* Floating Language Toggle Button */}
      <button
        type="button"
        onClick={() => setActiveTab(activeTab === "id" ? "en" : "id")}
        className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-16 h-16 bg-black text-white rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:scale-110 active:scale-95 transition-all group"
        title="Switch Language"
      >
        <span className="font-black font-mono text-xl uppercase">
          {activeTab}
        </span>
        
        {/* Tooltip */}
        <span className="absolute -top-10 right-0 bg-black text-white text-xs px-2 py-1 font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Switch to {activeTab === "id" ? "English" : "Indonesia"}
        </span>
      </button>
    </div>
  );
}
