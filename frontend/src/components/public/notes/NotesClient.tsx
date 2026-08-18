"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Blog } from "@/types";

interface NotesClientProps {
  initialNotes: Blog[];
}

export default function NotesClient({ initialNotes }: NotesClientProps) {
  const [notes] = useState<Blog[]>(initialNotes);
  const [currentLang, setCurrentLang] = useState("id");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("blogLang");
    if (savedLang) {
      setCurrentLang(savedLang);
    }
    NProgress.done();
  }, []);

  const updateLang = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLang = e.target.checked ? "en" : "id";
    setCurrentLang(newLang);
    localStorage.setItem("blogLang", newLang);
    document.cookie = `blogLang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    return { day, month, year };
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "IMG") {
      const src = (target as HTMLImageElement).src;
      if (src) setSelectedImage(src);
    }
  };

  return (
    <div className="pt-24 md:pt-40 pb-16 min-h-screen flex flex-col items-center font-[Inter]">
      <div className="w-full max-w-3xl px-4 md:px-8">
        {notes.length === 0 && <div className="text-center text-neutral-500 py-12">no notes yet!</div>}

        {notes.length > 0 && (
          <div className="w-full flex flex-col relative">
            <style>{`
            div.callout {
                position: relative !important;
              }
            .prose div.callout p { color: #a3a3a3 !important; }
            .dark .prose div.callout p { color: #737373 !important; }
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
              /* Links: underline only on hover */
              .prose a {
                text-decoration: none !important;
              }
              .prose a:hover {
                text-decoration: underline !important;
                text-decoration-color: inherit !important;
              }
              .prose p:empty::before { content: "\\00a0"; display: inline-block; }
              .prose p { color: #404040  !important; font-size: 16px; line-height: 28px }
              .dark .prose p { color: #a3a3a3  !important; }
              .prose a { font-weight: 600 !important; color: #000000 !important; text-decoration: underline !important; text-decoration-color: #d4d4d8 !important; text-underline-offset: 2px !important; transition: all 0.2s ease-in-out; }
              .dark .prose a { color: #e5e5e5 !important; text-decoration-color: #3f3f46 !important; }
              .prose a:hover { text-decoration-color: #171717 !important; }
              .dark .prose a:hover { text-decoration-color: #e5e5e5 !important; }
              .prose img { display: block; margin: 1.5em auto; max-width: 100%; height: auto; cursor: pointer; }
              .prose h2, .prose h3 { position: relative;  font-weight:normal; }
              .prose h2::before, .prose h3::before { content: "#"; position: absolute; left: -1em; opacity: 0; color: #a3a3a3; transition: opacity 0.2s ease-in-out; }
              .prose h2:hover::before, .prose h3:hover::before { opacity: 1; }
              .prose ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
              .prose ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
              .prose li { margin-bottom: 0.5em; }
            `}</style>
            {/* Language Toggle */}
            <div className="mb-10 flex items-center justify-start z-20">
              <label className="flex items-center gap-2 text-sm text-black/30 dark:text-white/30">
                <input
                  type="checkbox"
                  checked={currentLang === "en"}
                  onChange={updateLang}
                  className="w-[13px] h-[13px] appearance-none border-[1.4px] border-black/30 dark:border-white/30 rounded-[1px] bg-transparent flex items-center justify-center checked:before:content-[''] checked:before:w-[4px] checked:before:h-[6.5px] checked:before:border-r-[1.4px] checked:before:border-b-[1.4px] checked:before:border-black/30 dark:checked:before:border-white/30 checked:before:rotate-45 checked:before:-mt-[1px]"
                />
                <span>Read in English</span>
              </label>
            </div>

            <div className="flex flex-col gap-16 md:gap-24">
              {notes.map((note, index) => {
                const { day, month, year } = formatDate(note.created_at);
                const content = currentLang === "en" ? note.content_en || note.content : note.content;

                return (
                  <div
                    key={note.id}
                    data-animate
                    style={{ "--stagger": index } as React.CSSProperties}
                    className="flex flex-col md:flex-row items-start gap-4 md:gap-12">
                    {/* Left Date Rail */}
                    <div className="flex-shrink-0 md:w-24 text-neutral-500 dark:text-neutral-500 text-sm leading-tight pt-1">
                      <div className="flex md:flex-col gap-2 md:gap-0">
                        <span>
                          {day} {month}
                        </span>
                        <span>{year}</span>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div
                      className="flex-grow prose prose-neutral dark:prose-invert prose-lg max-w-none font-[Inter] prose-headings:font-black prose-headings:text-black dark:prose-headings:text-white prose-img:rounded-lg [&_div.callout]:flex [&_div.callout]:my-6 [&_div.callout]:items-start [&_div.callout]:border-l-0 [&_div.callout]:border-neutral-300 [&_div.callout]:dark:border-neutral-700 [&_div.callout]:relative [&_div.callout]:pl-6 [&_div.callout]:py-1 [&_div.callout]:text-sm [&_div.callout]:md:text-base [&_div.callout]:text-neutral-400 [&_div.callout]:dark:text-neutral-500 [&_div.callout]:not-italic"
                      dangerouslySetInnerHTML={{ __html: content }}
                      onClick={handleContentClick}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedImage &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}>
            <img src={selectedImage} className="w-full h-full object-contain" alt="Enlarged Note Image" />
          </div>,
          document.body,
        )}
    </div>
  );
}
