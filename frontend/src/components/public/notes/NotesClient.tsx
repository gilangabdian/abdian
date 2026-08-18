"use client";

import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Blog } from "@/types";

interface NotesClientProps {
  initialNotes: Blog[];
}

export default function NotesClient({ initialNotes }: NotesClientProps) {
  const [notes] = useState<Blog[]>(initialNotes);
  const [currentLang, setCurrentLang] = useState("id");

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

  return (
    <div className="pt-24 md:pt-40 pb-16 min-h-screen flex flex-col items-center font-[Inter]">
      <div className="w-full max-w-3xl px-4 md:px-8">
        {notes.length === 0 && <div className="text-center text-neutral-500 py-12">no notes yet!</div>}

        {notes.length > 0 && (
          <div className="w-full flex flex-col relative">
            {/* Language Toggle */}
            <div className="mb-10 flex items-center justify-start z-20">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-black/30 dark:text-white/30">
                <input
                  type="checkbox"
                  checked={currentLang === "en"}
                  onChange={updateLang}
                  className="w-[13px] h-[13px] cursor-pointer appearance-none border-[1.4px] border-black/30 dark:border-white/30 rounded-[1px] bg-transparent flex items-center justify-center checked:before:content-[''] checked:before:w-[4px] checked:before:h-[6.5px] checked:before:border-r-[1.4px] checked:before:border-b-[1.4px] checked:before:border-black/30 dark:checked:before:border-white/30 checked:before:rotate-45 checked:before:-mt-[1px]"
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
                    <div className="flex-shrink-0 md:w-24 text-neutral-400 dark:text-neutral-500 font-mono text-sm leading-tight pt-1">
                      <div className="flex md:flex-col gap-2 md:gap-0">
                        <span className="font-bold">
                          {day} {month}
                        </span>
                        <span>{year}</span>
                      </div>
                    </div>

                    {/* Note Content */}
                    <div
                      className="flex-grow prose prose-neutral dark:prose-invert prose-lg max-w-none
                      prose-p:leading-relaxed prose-p:text-neutral-700 dark:prose-p:text-neutral-300
                      prose-a:text-black dark:prose-a:text-white prose-a:decoration-neutral-400 dark:prose-a:decoration-neutral-600
                      hover:prose-a:decoration-black dark:hover:prose-a:decoration-white prose-a:transition-colors
                      prose-img:rounded-lg"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
