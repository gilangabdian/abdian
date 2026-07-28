import React, { useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/night-owl.css";

interface BlogPreviewProps {
  title: string;
  title_en: string;
  content: string;
  content_en: string;
  activeTab: "id" | "en";
  setActiveTab: (tab: "id" | "en") => void;
  setIsPreviewMode: (val: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isSaving: boolean;
}

export default function BlogPreview({
  title,
  title_en,
  content,
  content_en,
  activeTab,
  setActiveTab,
  setIsPreviewMode,
  handleSubmit,
  isSaving,
}: BlogPreviewProps) {
  const displayTitle = activeTab === "id" ? title || "Untitled Blog" : title_en || "Untitled Blog (EN)";

  const displayContent = activeTab === "id" ? content : content_en;

  useEffect(() => {
    const codeBlocks = document.querySelectorAll(".prose pre code");
    codeBlocks.forEach((block) => {
      block.removeAttribute("data-highlighted");
      hljs.highlightElement(block as HTMLElement);
    });
  }, [displayContent, activeTab]);

  return (
    <div className="bg-white border-4 border-black p-6 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8">
      <style>{`
      div.callout {
          position: relative !important;
        }
        div.callout::before {
          content: '';
          position: absolute;
          left: 0;
          top:1.5em;
          bottom: 1.5em;
          width: 4px;
          background: #d4d4d8;
          border-radius: 2px;
        }
        .dark div.callout::before {
          background: #404040;
        }
        /* Links: underline only on hover */
        .prose a {
          text-decoration: none !important;
        }
        .prose a:hover {
          text-decoration: underline !important;
          text-decoration-color: inherit !important;
        }
        .prose p:empty::before { content: "\\00a0"; display: inline-block; }
        .prose p { color: #52525b !important; }
        .prose a { font-weight: 600 !important; color: #000000 !important; text-decoration: underline !important; text-decoration-color: #d4d4d8 !important; text-underline-offset: 2px !important; transition: all 0.2s ease-in-out; }
        .prose a:hover { text-decoration-color: #171717 !important; }
        .prose img { display: block; margin: 1.5em auto; max-width: 100%; height: auto; cursor: pointer; }
        .prose h2, .prose h3 { position: relative; }
        .prose h2::before, .prose h3::before { content: "#"; position: absolute; left: -1em; opacity: 0; color: #a3a3a3; transition: opacity 0.2s ease-in-out; }
        .prose h2:hover::before, .prose h3:hover::before { opacity: 1; }
        .prose ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .prose ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
        .prose li { margin-bottom: 0.5em; }
      `}</style>
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
          English
        </button>
      </div>

      <article className="relative mt-8">
        <header className="mb-12">
          <h1 className="text-3xl md:text-5xl font-medium leading-tight mb-4 text-black">{displayTitle}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            <span>
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span>—</span>
            <span>~ min read</span>
          </div>
        </header>

        <div
          className="prose prose-neutral prose-lg max-w-none font-[Inter] prose-headings:font-black prose-headings:text-black prose-a:text-neutral-600 hover:prose-a:text-black prose-a:transition-colors prose-img:rounded-lg prose-img:mx-auto [&_div.callout]:flex [&_div.callout]:my-6 [&_div.callout]:items-start [&_div.callout]:border-l-0 [&_div.callout]:border-neutral-300 [&_div.callout]:dark:border-neutral-700 [&_div.callout]:relative [&_div.callout]:pl-6 [&_div.callout]:py-1 [&_div.callout]:text-sm [&_div.callout]:md:text-base [&_div.callout]:text-neutral-400 [&_div.callout]:dark:text-neutral-500 [&_div.callout]:not-italic"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
      </article>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-8 border-t-4 border-black mt-12">
        <button
          type="button"
          onClick={() => setIsPreviewMode(false)}
          className="bg-gray-200 text-black px-8 py-3 font-black tracking-widest uppercase border-4 border-black hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          Back to Edit
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-black text-white px-8 py-3 font-black tracking-widest uppercase border-4 border-black hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed">
          {isSaving ? "Saving..." : "Save Blog"}
        </button>
      </div>
    </div>
  );
}
