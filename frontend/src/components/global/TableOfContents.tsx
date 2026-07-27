"use client";

import React from "react";

interface TocItem {
  id: string;
  text: string;
  level: string; // "h2" | "h3"
}

interface TableOfContentsProps {
  toc: TocItem[];
  show: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onScrollToHeading: (e: React.MouseEvent, id: string) => void;
}

export default function TableOfContents({
  toc,
  show,
  onMouseEnter,
  onMouseLeave,
  onScrollToHeading,
}: TableOfContentsProps) {
  if (toc.length === 0) return null;

  return (
    <>
      <style>{`
        .toc-sidebar::-webkit-scrollbar { width: 4px; }
        .toc-sidebar::-webkit-scrollbar-track { background: transparent; }
        .toc-sidebar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.02); border-radius: 4px; }
        .dark .toc-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.02); }
        .toc-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
        .dark .toc-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>
      <div
        className={`hidden lg:block fixed left-0 bottom-40 w-[calc(50%-24rem)] h-full z-40 pointer-events-auto transition-all duration-300 ease-in-out ${
          show ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}>
        <div className="toc-sidebar absolute left-0 top-34 pl-7 xl:pl-10 mt-32 max-h-[70vh] overflow-y-auto">
          <ul className="flex flex-col gap-2 text-xs border-l-2 border-neutral-200 dark:border-neutral-800 pl-4 w-48 xl:w-64 select-none">
            {toc.map((item, index) => (
              <li key={`${index}-${item.id}`} className={`w-fit ${item.level === "h3" ? "ml-4 text-xs" : ""}`}>
                <span
                  onClick={(e) => onScrollToHeading(e, item.id)}
                  className="cursor-pointer border-b border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all leading-snug">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
